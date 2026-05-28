import { redirect } from "react-router-dom";

import { supabase } from "@/api/client";
import { getSession } from "@/api/auth";
import { getMaster } from "@/api/word";
import { getProfile } from "@/api/profile";
import { getVoca, postVoca } from "@/api/voca";

import { setStorage, getStorage, removeStorage, KEYS } from "@/utils/storage";

import { processWordMap, createGuestStatusMap } from "./utils";
import { migrateVoca } from "@/api/migration";

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
    // 단어 전체 상세 데이터 대신 가벼운 카테고리 집계 정보 조회
    const [session, categoryStatsResult, dbNotisResult] = await Promise.all([
      getSession(),
      supabase.from("Word").select("category"),
      supabase.from("Notification").select("*").order("created_at", { ascending: false })
    ]);

    // DB 상의 카테고리별 단어 개수 계산
    const dbCategories = categoryStatsResult.data || [];
    const dbStats = {};
    dbCategories.forEach(item => {
      const cat = item.category || "default";
      dbStats[cat] = (dbStats[cat] || 0) + 1;
    });

    // 로컬 스토리지 캐시 및 캐시의 카테고리별 단어 개수 계산
    const cachedWords = getStorage(KEYS.MASTER) || {};
    const cachedStats = {};
    Object.values(cachedWords).forEach(item => {
      const cat = item.category || "default";
      cachedStats[cat] = (cachedStats[cat] || 0) + 1;
    });

    // 카테고리별 갯수가 완벽히 일치하고, 캐시 데이터가 실제 존재하는지 검증
    const categories = Array.from(new Set([...Object.keys(dbStats), ...Object.keys(cachedStats)]));
    const isCacheValid = categories.length > 0 && categories.every(cat => dbStats[cat] === cachedStats[cat]) && Object.keys(cachedWords).length > 0;

    let wordData;
    if (isCacheValid) {
      // 캐시 유효: DB 조회를 스킵하고 로컬 캐시에서 상위 120개 고속 슬라이싱
      const wordMap = {};
      const sortedItems = Object.values(cachedWords).sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return (a.word || "").localeCompare(b.word || "");
      });
      const sliced = sortedItems.slice(0, 120);
      sliced.forEach(item => {
        wordMap[item.id] = item;
      });
      wordData = wordMap;
    } else {
      // 캐시 무효: 로컬 캐시를 비우고 DB에서 처음 120개 고속 쿼리 진행
      removeStorage(KEYS.MASTER);
      wordData = await getMaster(120, 0);
    }

    const notifications = dbNotisResult.data || [];
    notifications.unshift(
      session
        ? { id: "sync_ok", title: "동기화 완료", content: "계정 데이터와 실시간 동기화 중입니다.", type: "status" }
        : { id: "sync_req", title: "데이터 동기화 권장", content: "로그인하여 학습 기록을 안전하게 보관하세요.", type: "sync" }
    );

    // 2. 레거시 숫자 selected 인덱스를 신규 문자열 고유 영문 ID로 마이그레이션 및 자동 복구 방어 코드
    const profile = getStorage(KEYS.PROFILE);
    const wordMaps = getStorage(KEYS.VOCA);
    if (profile && typeof profile.selected === "number" && wordMaps) {
      const currentLevel = profile.level || "default";
      const levelVoca = wordMaps[currentLevel] || [];
      const legacyIndex = profile.selected;
      if (levelVoca[legacyIndex]) {
        profile.selected = levelVoca[legacyIndex].id;
      } else {
        profile.selected = levelVoca[0]?.id || "";
      }
      setStorage(KEYS.PROFILE, profile);
    }

    // 3. 세션 여부에 따른 흐름 제어
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
        profile: { level: "default" },
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
  const localUserData = getStorage(KEYS.PROFILE);
  const currentLevel = localUserData?.level || "default";

  // 난이도별 DB 코드 매핑 (초급 default -> 700)
  const levelToNumber = { "default": 700, "800": 800, "900": 900 };
  const dbLevel = levelToNumber[currentLevel] ?? 700;

  // 1. 마이그레이션 체크 및 기본 데이터 로드
  let wordMaps = getStorage(KEYS.VOCA);

  // 레거시 로컬 데이터가 있으면 DB로 이전
  if (wordMaps) {
    await migrateVoca();
    wordMaps = getStorage(KEYS.VOCA);
  }

  // 2. 프로필 및 학습 데이터 병렬 로드
  const [userProfile, vocaData] = await Promise.all([
    getProfile(),
    getVoca(dbLevel)
  ]);

  if (!userProfile) throw new Error("User profile not found");

  // 3. 템플릿 로드 (없으면 초기화)
  if (!wordMaps) {
    await postVoca(currentLevel);
    wordMaps = getStorage(KEYS.VOCA);
  }
  const baseWordMap = wordMaps?.[currentLevel] || [];

  // 4. 상태 맵 생성 및 데이터 병합
  const wordStatusMap = (vocaData || []).reduce((acc, curr) => {
    acc[curr.word_id] = curr.status;
    return acc;
  }, {});

  const processedWordMap = processWordMap(baseWordMap, wordStatusMap);

  const localProfile = getStorage(KEYS.PROFILE) || {};

  return {
    nick: localProfile.nick || userProfile.nick,
    voca: processedWordMap,
    wordStatusMap,
    master: wordData,
    notifications,
    isCacheValid,
    profile: {
      startedTime: new Date(userProfile.created_at).getTime(),
      continued: 0,
      today: 0,
      learned: (vocaData || []).filter(v => v.status).length,
      selected: localUserData?.selected || baseWordMap[0]?.id || "",
      level: currentLevel,
    }
  };
}

/**
 * 미인증 사용자(Guest)를 위한 데이터 로딩 및 가공
 */
function handleGuestLoading(wordData, notifications, isWelcomePath, isCacheValid) {
  const profile = getStorage(KEYS.PROFILE);
  const wordMaps = getStorage(KEYS.VOCA);

  console.log("guest");

  if (!profile || !profile.nick) {
    if (isWelcomePath) {
      return {
        nick: "",
        voca: [],
        wordStatusMap: {},
        master: {},
        profile: { level: "default" },
        notifications: [],
        isCacheValid: false
      };
    }
    return redirect("/welcome/profile");
  }
  if (!wordMaps) {
    if (isWelcomePath) {
      return {
        nick: profile.nick,
        voca: [],
        wordStatusMap: {},
        master: {},
        profile,
        notifications,
        isCacheValid: false
      };
    }
    return redirect("/welcome/voca");
  }

  const currentLevel = profile.level || "default";
  const rawWordMap = wordMaps[currentLevel] || [];

  const statusMap = createGuestStatusMap(rawWordMap);
  const processedWordMap = processWordMap(rawWordMap, statusMap);

  return {
    nick: profile.nick,
    voca: processedWordMap,
    wordStatusMap: statusMap,
    master: wordData,
    profile,
    notifications,
    isCacheValid,
  };
}
