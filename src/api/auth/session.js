import { supabase } from "@/api/client";

/**
 * 현재 사용자의 세션 정보를 가져옵니다.
 * @returns {Promise<Object|null>} Supabase 세션 객체 또는 null
 * @description Supabase auth.getSession()의 래퍼 함수입니다.
 */
let _cachedSession = null;
let _inflightPromise = null;

export const getSession = async () => {
  // 캐시가 있으면 바로 반환
  if (_cachedSession) return _cachedSession;
  // 진행 중인 요청이 있으면 동일 프라미스 재사용
  if (_inflightPromise) return _inflightPromise;

  _inflightPromise = supabase.auth.getSession()
    .then(({ data: { session }, error }) => {
      if (error) {
        console.error("[API/Auth] Get Session Error:", error.message);
        return null;
      }
      _cachedSession = session;
      return session;
    })
    .finally(() => {
      _inflightPromise = null;
    });

  return _inflightPromise;
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

/**
 * 세션 캐시를 초기화합니다. 로그아웃 시 호출됩니다.
 */
export const clearSessionCache = () => {
  _cachedSession = null;
};
