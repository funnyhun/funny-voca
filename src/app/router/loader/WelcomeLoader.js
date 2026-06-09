import { redirect } from "react-router-dom";
import { getProfileCache } from "@/api/common";

/**
 * 온보딩 가드 및 리다이렉션 전담 로더입니다.
 * 사용자의 닉네임 설정이 완료되지 않았을 시 /welcome/profile로 안전하게 리다이렉트합니다.
 */
export const WelcomeLoader = async () => {
  const profile = getProfileCache();

  if (!profile || !profile.nick) {
    return redirect("/welcome/profile");
  }

  return null;
};
