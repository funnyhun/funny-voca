import { supabase } from "@/common/api/common/supabase";
import { clearSessionCache } from "@/common/api/auth/session";

/**
 * Kakao OAuth 로그인을 수행합니다.
 * @returns {Promise<void>}
 */
export const signInWithKakao = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: import.meta.env.DEV ? window.location.origin : import.meta.env.VITE_SUPABASE_REDIRECT_URL,
      scopes: "", // Supabase의 기본 스코프(이메일 등) 삽입을 차단하기 위해 빈 값 전달
      queryParams: {
        scope: "profile_nickname", // 실제 카카오에 전달할 스코프만 명시
      },
    },
  });

  if (error) {
    console.error("로그인 중 오류 발생:", error.message);
  }
};

/**
 * 로그아웃을 수행합니다.
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("로그아웃 중 오류 발생:", error.message);
  }
  // 세션 캐시 초기화
  clearSessionCache();
};
