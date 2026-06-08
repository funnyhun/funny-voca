import { redirect } from "react-router-dom";
import { getProfileCache, getVocaCache } from "@/api/common";
import { getSession } from "@/api/auth";

/**
 * 퀴즈(Quiz) 페이지 진입 시 마지막 학습 위치 또는 기본 위치로 리다이렉트합니다.
 */
export const loadQuiz = async () => {
  const session = await getSession();

  if (session) return null;

  // Guest Onboarding Validation
  const profile = getProfileCache();
  if (!profile || !profile.nick) {
    return redirect("/welcome/profile");
  }

  const wordMaps = getVocaCache();
  if (!wordMaps) {
    return redirect("/welcome/voca");
  }

  return null;
};
