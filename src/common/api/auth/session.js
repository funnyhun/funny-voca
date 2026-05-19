import { supabase } from "@/common/api/common/supabase";

/**
 * 현재 사용자의 세션 정보를 가져옵니다.
 * @returns {Promise<Object|null>} Supabase 세션 객체 또는 null
 * @description Supabase auth.getSession()의 래퍼 함수입니다.
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[API/Auth] Get Session Error:", error.message);
      return null;
    }
    return session;
  } catch (err) {
    console.error("[API/Auth] Critical Session Error:", err);
    return null;
  }
};

/**
 * 현재 로그인된 사용자의 ID를 가져옵니다.
 * @returns {Promise<string|null>} 사용자 UUID 또는 null
 */
export const getUserId = async () => {
  const session = await getSession();
  return session?.user?.id || null;
};

/**
 * 현재 사용자가 게스트인지 동기적으로 확인합니다 (로컬스토리지 토큰 존재 여부 기준).
 * @returns {boolean}
 */
export const checkIsGuest = () => {
  try {
    return !Object.keys(window.localStorage).some((k) => k.includes("auth-token"));
  } catch (err) {
    return true;
  }
};

