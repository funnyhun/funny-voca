import React from "react";
import { useLocation } from "react-router-dom";
import { Loading } from "@/app/layout";
import { Spinner } from "../Spinner/Spinner";

export const AppFallback = () => {
  let fromOnboarding = false;
  
  try {
    const location = useLocation();
    fromOnboarding = !!location.state?.fromOnboarding;
  } catch (error) {
    console.warn("[AppFallback] useLocation failed", error);
  }

  if (fromOnboarding) {
    // 온보딩 완료 후 진입하는 경우 -> 진행바 + 진행율 대기 UI 제공
    return <Spinner fullScreen message="데이터를 구성하고 있습니다..." />;
  }

  // 일반 새로고침 및 재로딩 시 -> 3번 스플래시 이미지 화면 제공
  return <Loading />;
};
