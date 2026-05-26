import { getStorage, setStorage, KEYS } from "@/utils/storage";

/**
 * 게스트 사용자의 학습 통계(연속 학습일, 오늘 학습량)를 로컬스토리지에 업데이트합니다.
 */
export const updateStats = () => {
  const userData = getStorage(KEYS.USER_DATA);
  if (!userData) return;

  const msToDay = 86400000;
  const now = new Date();
  const todayMidnight = new Date(now).setHours(0, 0, 0, 0);
  const lastStudiedAt = userData.lastStudiedAt || null;

  let { continued = 0, today = 0 } = userData;

  if (lastStudiedAt) {
    const lastDay = new Date(lastStudiedAt).setHours(0, 0, 0, 0);
    const diffDays = Math.floor((todayMidnight - lastDay) / msToDay);

    if (diffDays === 0) {
      // 오늘 이미 학습한 경우: today만 증가
      today += 1;
    } else if (diffDays === 1) {
      // 어제 학습했고 오늘 최초 완료: 연속 학습 유지 + today 리셋
      continued += 1;
      today = 1;
    } else {
      // 이틀 이상 공백: 연속 학습 초기화
      continued = 1;
      today = 1;
    }
  } else {
    // 최초 학습 완료
    continued = 1;
    today = 1;
  }

  const updated = {
    ...userData,
    today,
    continued,
    lastStudiedAt: now.toISOString(),
  };

  setStorage(KEYS.USER_DATA, updated);
};
