import { getSession } from "@/api/auth";
import { getProfile as getProfileGuest, updateProfile as updateProfileGuest } from "./profile.guest";
import { getProfile as getProfileUser, updateProfile as updateProfileUser } from "./profile.user";
import { getProfileCache, setProfileCache } from "@/api/common";
import { getLocalVocaList } from "@/api/voca/voca.local";

/**
 * 세션 상태에 따라 게스트 또는 로그인 사용자의 프로필을 조회하고 캐시를 최신화하여 반환합니다.
 * @returns {Promise<Object|null>} 프로필 정보
 */
export const getProfile = async () => {
  const session = await getSession();
  if (session) {
    const userProfile = await getProfileUser(session.user.id);
    if (!userProfile) return null;

    // Voca 로컬 데이터를 읽어와 learned 및 selected 기본값 매핑 (순환 방지를 위해 getLocalVocaList 직접 사용)
    const vocaData = await getLocalVocaList();
    const currentLevel = userProfile.level === "default" ? 700 : (parseInt(userProfile.level) || 700);
    const currentLevelVoca = vocaData[currentLevel] || [];
    const defaultSelected = currentLevelVoca[0]?.voca_label || "";

    // Streak 최댓값 병합
    const mergedContinued = Math.max(userProfile.continued || 0, getProfileCache()?.continued || 0);

    const localProfile = {
      startedTime: new Date(userProfile.created_at).getTime(),
      continued: mergedContinued,
      today: 0,
      learned: currentLevelVoca.filter((v) => v.status === true).length,
      selected: userProfile.selected || getProfileCache()?.selected || defaultSelected,
      level: currentLevel,
      completed_date: userProfile.completed_date || null,
      nick: userProfile.nick
    };

    setProfileCache(localProfile);

    return {
      user_id: session.user.id,
      ...localProfile
    };
  }
  return getProfileGuest();
};

/**
 * 세션 상태에 따라 게스트 또는 로그인 사용자의 프로필을 업데이트합니다.
 * @param {Object} data - 업데이트할 프로필 데이터
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export const updateProfile = async (data) => {
  const session = await getSession();
  if (session) {
    return updateProfileUser(session.user.id, data);
  }
  return updateProfileGuest(data);
};
