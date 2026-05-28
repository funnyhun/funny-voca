import { redirect } from "react-router-dom";

import { supabase } from "@/api/client";
import { getSession } from "@/api/auth";
import { getWordsByChunk } from "@/api/master";
import { getProfile } from "@/api/profile";
import { getVocaList, reschedule } from "@/api/voca";

import { setStorage, getStorage, removeStorage, KEYS } from "@/utils/storage";

/**
 * [Orchestrator] 어플리케이션 진입 시 필요한 모든 데이터를 로드하고 상태에 따라 분기합니다.
 * 
 * @returns {Promise<Object|Response>} 앱 컨텍스트 데이터 또는 리다이렉트 응답
 */
export const loadUserData = async ({ request }) => {
  const url = new URL(request.url);

  const rawBasePath = import.meta.env.VITE_BASE_PATH || "/";
  const basename = rawBasePath.endsWith("/") && rawBasePath !== "/" ? rawBasePath.slice(0, -1) : rawBasePath;
  const relativePath = basename !== "/" && url.pathname.startsWith(basename)
    ? url.pathname.slice(basename.length)
    : url.pathname;

  const isWelcomePath = relativePath.startsWith("/welcome");

  try {
    // 1. 공통 데이터 로드 및 세션 조회를 병렬로 수행 (성능 최적화)
    const [session, dbNotisResult] = await Promise.all([
      getSession(),
      supabase.from("Notification").select("*").order("created_at", { ascending: false })
    ]);

    // 캐시 유효성 임시 참값 설정 (5단계 DROP 전까지 안전 유지)
    const isCacheValid = true;
    const wordData = {}; // 1단계 IN 쿼리 선제 로더가 추후 처리하므로 빈 객체 처리

    const notifications = dbNotisResult.data || [];
    notifications.unshift(
      session
        ? { id: "sync_ok", title: "동기화 완료", content: "계정 데이터와 실시간 동기화 중입니다.", type: "status" }
        : { id: "sync_req", title: "데이터 동기화 권장", content: "로그인하여 학습 기록을 안전하게 보관하세요.", type: "sync" }
    );

    // 2. 세션 여부에 따른 흐름 제어
    if (session) {
      return await handleMemberLoading(session, wordData, notifications, isWelcomePath, isCacheValid);
    } else {
      return handleGuestLoading(wordData, notifications, isWelcomePath, isCacheValid);
    }

  } catch (error) {
    console.error("[loadUserData] Critical Error:", error);
    if (isWelcomePath) {
      return {
        nick: "",
        voca: [],
        wordStatusMap: {},
        master: {},
        profile: { level: 700, selected: "", completed_date: null },
        notifications: [],
        isCacheValid: false
      };
    }
    return redirect("/welcome/profile");
  }
};

/**
 * 로그인 사용자(Member)를 위한 데이터 로딩 및 가공
 */
async function handleMemberLoading(session, wordData, notifications, isWelcomePath, isCacheValid) {
  const userId = session.user.id;

  // 1. 프로필 조회 (selected, completed_date, level 등 수집)
  const userProfile = await getProfile(userId);
  if (!userProfile) throw new Error("User profile not found");

  const rawLevel = userProfile.level;
  const currentLevel = rawLevel === "default" ? 700 : (parseInt(rawLevel) || 700);

  // 2. 청크 단위 Voca 목록 조회
  let vocaData = await getVocaList();

  // 3. Voca 목록이 없다면 최초 1회 동적 정렬 배정 및 초기화 구축
  if (!vocaData || Object.keys(vocaData).length === 0) {
    await reschedule(currentLevel, null, false);
    vocaData = await getVocaList();
  }

  // 로컬 프로필 캐시 동기화
  const currentLevelVoca = vocaData[currentLevel] || [];
  const defaultSelected = currentLevelVoca[0]?.voca_label || "";

  const localProfile = {
    startedTime: new Date(userProfile.created_at).getTime(),
    continued: userProfile.continued || 0,
    today: 0,
    learned: currentLevelVoca.filter((v) => v.status === true).length,
    selected: userProfile.selected || getStorage(KEYS.PROFILE)?.selected || defaultSelected,
    level: currentLevel,
    completed_date: userProfile.completed_date || null,
    nick: userProfile.nick
  };
  setStorage(KEYS.PROFILE, localProfile);

  return {
    nick: userProfile.nick,
    voca: vocaListToUI(vocaData),
    wordStatusMap: {}, // 신규 청크 스키마 하에서 wordStatusMap은 사용되지 않음
    master: wordData,
    notifications,
    isCacheValid,
    profile: localProfile
  };
}

/**
 * 미인증 사용자(Guest)를 위한 데이터 로딩 및 가공
 */
async function handleGuestLoading(wordData, notifications, isWelcomePath, isCacheValid) {
  let profile = getStorage(KEYS.PROFILE);

  // 1. 순수 극초기 진입 시점 (프로필 캐시가 아예 없는 단계)
  if (!profile || !profile.nick) {
    if (isWelcomePath) {
      let rawVocaData = await getVocaList() || {};
      let lvl700Data = rawVocaData["700"] || [];

      // Voca 학습 데이터가 전혀 구축되지 않았다면 로더 단에서 700 레벨을 즉시 선제 배정 및 캐싱
      if (lvl700Data.length === 0) {
        console.log("[Loader/Guest] 700 레벨 학습 데이터를 선제 배정 및 초기화합니다.");
        const newVocaList = await reschedule(700, null, false);
        rawVocaData = newVocaList || {};
        lvl700Data = rawVocaData["700"] || [];
      }

      const vocaData = {
        700: lvl700Data,
        800: [],
        900: []
      };

      const firstChunk = lvl700Data[0];
      let initialMasterData = {};

      // 1순위 학습 청크의 단어 데이터를 Supabase에서 정밀 선제 쿼리
      if (firstChunk && firstChunk.word && firstChunk.word.length > 0) {
        console.log(`[Loader/Guest] 1순위 청크 단어 선제 쿼리 가동 -> ${firstChunk.voca_label}`);
        initialMasterData = await getWordsByChunk(firstChunk.word);
        
        // 로컬 마스터 캐시에 실시간 점진 커밋
        const cumulativeWords = getStorage(KEYS.MASTER) || {};
        Object.assign(cumulativeWords, initialMasterData);
        setStorage(KEYS.MASTER, cumulativeWords);
      }

      return {
        nick: "",
        voca: vocaListToUI(vocaData),
        wordStatusMap: {},
        master: initialMasterData,
        profile: { level: 700, selected: firstChunk?.voca_label || "", completed_date: null },
        notifications: [],
        isCacheValid: false
      };
    }
    return redirect("/welcome/profile");
  }

  // 2. 게스트 재진입 시
  if (!profile.level) {
    if (profile.selected && String(profile.selected).startsWith("default")) {
      profile.selected = ""; // 기본값 재배정을 위해 비움
    }
    setStorage(KEYS.PROFILE, profile);
  }

  // 게스트 Voca 목록 로드
  let vocaData = await getVocaList();
  const currentLevel = profile.level || 700;
  const levelVoca = vocaData[currentLevel] || [];
  const selectedLabel = profile.selected || levelVoca[0]?.voca_label || "";

  // 현재 암기해야 할 selected 청크 단어가 로컬 캐시에 빠져있다면 로더에서 선제 보완 쿼리
  const currentChunk = levelVoca.find((v) => v.voca_label === selectedLabel) || levelVoca[0];
  let cumulativeMaster = getStorage(KEYS.MASTER) || {};

  if (currentChunk && currentChunk.word && currentChunk.word.length > 0) {
    const isTargetLoaded = currentChunk.word.every((id) => cumulativeMaster[id] !== undefined || cumulativeMaster[String(id)] !== undefined);
    
    if (!isTargetLoaded) {
      console.log(`[Loader/Guest] 재진입 타겟 청크 단어 캐시 누락 감지. 선제 보완 쿼리 수행 -> ${currentChunk.voca_label}`);
      const fallbackWords = await getWordsByChunk(currentChunk.word);
      Object.assign(cumulativeMaster, fallbackWords);
      setStorage(KEYS.MASTER, cumulativeMaster);
    }
  }

  return {
    nick: profile.nick,
    voca: vocaListToUI(vocaData),
    wordStatusMap: {},
    master: cumulativeMaster,
    profile,
    notifications,
    isCacheValid,
  };
}

/**
 * Voca 목록 데이터를 종전의 UI가 자연스럽게 호환되도록 단순 가공해주는 헬퍼
 * @param {Object} groupedList 레벨별로 그룹화된 Voca 객체
 * @returns {Object} 가공 완료된 UI 대응 레벨별 그룹 객체
 */
function vocaListToUI(groupedList) {
  const processed = {};
  Object.keys(groupedList || {}).forEach((level) => {
    console.log(groupedList[level]);
    processed[level] = (groupedList[level] || []).map((item) => ({
      ...item,
      category: item.voca_label.split("-")[1], // 카테고리 영문
      day: item.schedule, // 권장 순번 매핑
      level: parseInt(level) || 700, // UI 가시성 및 편리함을 위해 level 프로퍼티 명시적 주입
    }));
  });
  return processed;
}
