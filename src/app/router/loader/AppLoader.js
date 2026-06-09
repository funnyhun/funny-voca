import { redirect } from "react-router-dom";
import { getProfile } from "@/api/profile";
import { getVoca } from "@/api/voca";
import { getNotifications } from "@/api/notification";
import { getMasterData } from "@/api/master";
import { parseMaster } from "./utils";
import { getSession } from "@/api/auth";

/**
 * [Orchestrator] 앱 구동에 필요한 초기 전역 데이터 스냅샷을 일괄 조회 및 가공하여 반환합니다.
 * 비즈니스 세부 조작 및 캐시 분기는 모두 각 도메인 API 내부에서 전담 처리됩니다.
 */
export const loadUserData = async ({ request }) => {
  const url = new URL(request.url);
  const isWelcomeRoute = url.pathname.startsWith("/welcome");

  // 1. 프로필, Voca 리스트, 알림 목록 병렬 수집
  const [profile, vocaData, notifications] = await Promise.all([
    getProfile(),
    getVoca(),
    getNotifications()
  ]);

  // 온보딩 가드: 웰컴 경로 이외 진입 시 닉네임 미설정 상태라면 온보딩 페이지로 강제 전송
  if (!isWelcomeRoute && (!profile || !profile.nick)) {
    return redirect("/welcome/profile");
  }

  // 온보딩 가드: 이미 닉네임이 완성된 사용자가 웰컴 경로 진입 시 홈으로 자동 복귀
  if (isWelcomeRoute && profile && profile.nick) {
    return redirect("/home");
  }

  // 2. 현재 활성화된 스케줄의 단어 데이터 마스터 캐시 동기화 보완 처리
  const master = await getMasterData(vocaData, profile);

  // 3. 세션 정보 획득 및 동기화 상태 노티 주입
  const session = await getSession();
  const notificationsList = notifications || [];
  
  const hasSyncNoti = notificationsList.some(n => n.id === "sync_ok" || n.id === "sync_req");
  if (!hasSyncNoti) {
    notificationsList.unshift(
      session
        ? { id: "sync_ok", title: "동기화 완료", content: "계정 데이터와 실시간 동기화 중입니다.", type: "status" }
        : { id: "sync_req", title: "데이터 동기화 권장", content: "로그인하여 학습 기록을 안전하게 보관하세요.", type: "sync" }
    );
  }

  return {
    nick: profile?.nick || "",
    voca: parseMaster(vocaData),
    wordStatusMap: {},
    master,
    profile,
    notifications: notificationsList
  };
};
