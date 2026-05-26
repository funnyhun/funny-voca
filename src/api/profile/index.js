import { getSession } from "@/api/auth";
import { getProfile as getProfileGuest, updateProfile as updateProfileGuest } from "./profile.guest";
import { getProfile as getProfileUser, updateProfile as updateProfileUser } from "./profile.user";

/**
 * 세션 상태에 따라 게스트 또는 로그인 사용자의 프로필을 조회합니다.
 * @returns {Promise<Object|null>} 프로필 정보
 */
export const getProfile = async () => {
  const session = await getSession();
  if (session) {
    return getProfileUser(session.user.id);
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
