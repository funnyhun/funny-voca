import React from "react";
import { Loading } from "../../../Layout/Loading/Loading";
import { Spinner } from "../Spinner/Spinner";

export const AppFallback = () => {
  // 로컬스토리지를 검사하여 닉네임 유무로 온보딩 완료 여부 판별
  const hasNick = typeof window !== "undefined" && !!window.localStorage.getItem("nick");

  if (hasNick) {
    // 가입된 기존 유저 혹은 온보딩을 갓 완료하여 진입하는 유저에게는 Spinner 제공
    return <Spinner fullScreen message="데이터를 구성하고 있습니다..." />;
  }

  // 온보딩 이전의 신규 유저에게는 최초 스플래시 이미지 화면 제공
  return <Loading />;
};
