import { redirect } from "react-router-dom";

import { supabase } from "@/api/client";
import { getSession } from "@/api/auth";
import { getMaster } from "@/api/word";
import { getProfile } from "@/api/profile";
import { getVoca, postVoca } from "@/api/voca";

import { getStorage, KEYS } from "@/utils/storage";

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
    const session = await getSession();

    // 1. 공통 데이터 로드 (마스터 데이터 및 알림)
    const [wordData, dbNotisResult] = await Promise.all([
      getMaster(),
      supabase.from("Notification").select("*").order("created_at", { ascending: false })
    ]);

    const notifications = dbNotisResult.data || [];
    notifications.unshift(
      session
        ? { id: "sync_ok", title: "동기화 완료", content: "계정 데이터와 실시간 동기화 중입니다.", type: "status" }
        : { id: "sync_req", title: "데이터 동기화 권장", content: "로그인하여 학습 기록을 안전하게 보관하세요.", type: "sync" }
    );

    // 2. 세션 여부에 따른 흐름 제어
    if (session) {
      return await handleMemberLoading(session, wordData, notifications, isWelcomePath);
    } else {
      return handleGuestLoading(wordData, notifications, isWelcomePath);
    }

  } catch (error) {
    console.error("[loadUserData] Critical Error:", error);
    if (isWelcomePath) {
      return {
        nick: "",
        wordMap: [],
        wordStatusMap: {},
        wordData: [],
        userData: { level: "default" },
        notifications: [],
      };
    }
    return redirect("/welcome/profile");
  }
};

/**
 * 로그인 사용자(Member)를 위한 데이터 로딩 및 가공
 */
async function handleMemberLoading(session, wordData, notifications, isWelcomePath) {
  const userId = session.user.id;
  const localUserData = getStorage(KEYS.USER_DATA);
  const currentLevel = localUserData?.level || "default";

  // 난이도별 DB 코드 매핑 (초급 default -> 700)
  const levelToNumber = { "default": 700, "800": 800, "900": 900 };
  const dbLevel = levelToNumber[currentLevel] ?? 700;

  // 1. 마이그레이션 체크 및 기본 데이터 로드
  let wordMaps = getStorage(KEYS.WORD_MAP);

  // 레거시 로컬 데이터가 있으면 DB로 이전
  if (wordMaps) {
    await migrateVoca();
    wordMaps = getStorage(KEYS.WORD_MAP);
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
    wordMaps = getStorage(KEYS.WORD_MAP);
  }
  const baseWordMap = wordMaps?.[currentLevel] || [];

  // 4. 상태 맵 생성 및 데이터 병합
  const wordStatusMap = (vocaData || []).reduce((acc, curr) => {
    acc[curr.word_id] = curr.status;
    return acc;
  }, {});

  const processedWordMap = processWordMap(baseWordMap, wordStatusMap);

  return {
    nick: getStorage(KEYS.NICK) || userProfile.nick,
    wordMap: processedWordMap,
    wordStatusMap,
    wordData,
    notifications,
    userData: {
      startedTime: new Date(userProfile.created_at).getTime(),
      continued: 0,
      today: 0,
      learned: (vocaData || []).filter(v => v.status).length,
      selected: localUserData?.selected || 0,
      level: currentLevel,
    }
  };
}

/**
 * 미인증 사용자(Guest)를 위한 데이터 로딩 및 가공
 */
function handleGuestLoading(wordData, notifications, isWelcomePath) {
  const nick = getStorage(KEYS.NICK);
  const wordMaps = getStorage(KEYS.WORD_MAP);
  const userData = getStorage(KEYS.USER_DATA);

  console.log("guest");

  if (!nick) {
    if (isWelcomePath) {
      return {
        nick: "",
        wordMap: [],
        wordStatusMap: {},
        wordData,
        userData: { level: "default" },
        notifications,
      };
    }
    return redirect("/welcome/profile");
  }
  if (!wordMaps || !userData) {
    if (isWelcomePath) {
      return {
        nick,
        wordMap: [],
        wordStatusMap: {},
        wordData,
        userData: { level: "default" },
        notifications,
      };
    }
    return redirect("/welcome/voca");
  }

  const currentLevel = userData.level || "default";
  const rawWordMap = wordMaps[currentLevel] || [];

  const statusMap = createGuestStatusMap(rawWordMap);
  const processedWordMap = processWordMap(rawWordMap, statusMap);

  return {
    nick,
    wordMap: processedWordMap,
    wordStatusMap: statusMap,
    wordData,
    userData,
    notifications,
  };
}
