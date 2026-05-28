import { redirect } from "react-router-dom";
import { supabase } from "@/api/client";
import { getStorage, KEYS } from "@/utils/storage";

/**
 * 퀴즈(Quiz) 페이지 진입 시 마지막 학습 위치 또는 기본 위치로 리다이렉트합니다.
 */
export const loadQuiz = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) return null;

  // Guest Onboarding Validation
  const profile = getStorage(KEYS.PROFILE);
  if (!profile || !profile.nick) {
    return redirect("/welcome/profile");
  }

  const wordMaps = getStorage(KEYS.VOCA);
  if (!wordMaps) {
    return redirect("/welcome/voca");
  }

  return null;
};
