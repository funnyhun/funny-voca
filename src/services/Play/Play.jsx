import { useMemo, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useWord } from "@/common/hooks/useWord";
import { useStep, useSelected } from "@/common/hooks/useMyParam";
import { Button } from "@/common/components";
import {
  Wrapper,
  AllDoneWrapper,
  AllDoneTitle,
  AllDoneDesc,
} from "./Play.styles";

export const Play = () => {
  const { selected } = useSelected();
  const { words } = useWord(selected);
  const { step } = useStep();
  const navigate = useNavigate();

  const remainingQuizs = useMemo(() => {
    return words.filter((w) => w.done === false);
  }, [words]);

  // 퀴즈 진입 시 모든 단어가 이미 암기 완료인 경우
  const isQuizRoute = window.location.pathname.includes("/quiz");
  if (isQuizRoute && words.length > 0 && remainingQuizs.length === 0) {
    return (
      <Wrapper>
        <AllDoneWrapper>
          <span style={{ fontSize: "3rem" }}>🎉</span>
          <AllDoneTitle>이미 모두 암기했어요!</AllDoneTitle>
          <AllDoneDesc>{"이 단어장의 모든 단어를\n이미 암기 완료했습니다."}</AllDoneDesc>
          <Button
            label="단어장으로 돌아가기"
            color="main"
            bg="brand"
            onClick={() => navigate(`/voca/${selected}`)}
          />
          <Button
            label="홈으로"
            color="font"
            bg="main"
            onClick={() => navigate("/home")}
          />
        </AllDoneWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Suspense fallback={<div>불러올 단어가 없습니다.</div>}>
        <Outlet key={step} />
      </Suspense>
    </Wrapper>
  );
};


