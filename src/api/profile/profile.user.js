import { supabase } from "@/api/client";

/**
 * 특정 사용자의 프로필 정보를 조회합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @returns {Promise<Object|null>} 사용자 프로필 정보 객체 또는 null
 */
export const getProfile = async (userId) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[API/User] Get Profile Error:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[API/User] Critical Profile Error:", err);
    return null;
  }
};

/**
 * 특정 사용자의 프로필 정보(닉네임 등)를 업데이트합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @param {Object} data - 업데이트할 프로필 데이터
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export const updateProfile = async (userId, data) => {
  if (!userId || !data) return false;

  try {
    const { error } = await supabase
      .from("User")
      .upsert({
        user_id: userId,
        nick: data.nick,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("[API/User] Update Profile Error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[API/User] Critical Profile Update Error:", err);
    return false;
  }
};
