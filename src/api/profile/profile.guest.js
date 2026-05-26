import { getStorage, setStorage, KEYS } from "@/utils/storage";

/**
 * 게스트 사용자의 프로필 정보를 조회합니다.
 * @returns {Object|null} 사용자 프로필 정보 객체 또는 null
 */
export const getProfile = () => {
  try {
    const nick = getStorage(KEYS.NICK);
    return {
      user_id: "guest",
      nick: nick || "게스트",
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
    if (data && typeof data === "object" && data.nick !== undefined) {
      setStorage(KEYS.NICK, data.nick);
      return true;
    }
    return false;
  } catch (err) {
    console.error("[API/Guest] Update Profile Error:", err);
    return false;
  }
};
