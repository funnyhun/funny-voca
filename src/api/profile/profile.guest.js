import { getProfileCache, setProfileCache } from "@/api/common";

/**
 * 게스트 사용자의 프로필 정보를 조회합니다.
 * @returns {Object|null} 사용자 프로필 정보 객체 또는 null
 */
export const getProfile = () => {
  try {
    const profile = getProfileCache();
    return {
      user_id: "guest",
      nick: profile.nick || "게스트",
      ...profile,
    };
  } catch (err) {
    console.error("[API/Guest] Get Profile Error:", err);
    return null;
  }
};

/**
 * 게스트 사용자의 프로필 정보(닉네임 등)를 업데이트합니다.
 * @param {Object} data - 업데이트할 프로필 데이터
 * @returns {boolean} 업데이트 성공 여부
 */
export const updateProfile = (data) => {
  try {
    if (data && typeof data === "object") {
      setProfileCache(data);
      return true;
    }
    return false;
  } catch (err) {
    console.error("[API/Guest] Update Profile Error:", err);
    return false;
  }
};
