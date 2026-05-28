import { useMemo, Suspense, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { useWord } from "@app/hooks";
import { Button } from "@app/components";
import { Item as Card } from "./Item";
import {
  Wrapper,
  AllDoneWrapper,
  AllDoneTitle,
  AllDoneDesc,
} from "./Play.styles";

export const Play = () => {
  const context = useOutletContext();
  const { statsState } = context;
  const { profile } = statsState;
  const { words } = useWord();
  const navigate = useNavigate();
  const [isReview, setIsReview] = useState(false);

  const remainingQuizs = useMemo(() => {
    return words.filter((w) => w.done === false);
  }, [words]);

  // 퀴즈 진입 시 모든 단어가 이미 암기 완료인 경우
  const isQuizRoute = window.location.pathname.includes("/quiz");
  if (!isQuizRoute && words.length > 0 && remainingQuizs.length === 0 && !isReview) {
    return (
      <Wrapper>
        <AllDoneWrapper>
          <span style={{ fontSize: "3rem" }}>🎉</span>
          <AllDoneTitle>이미 모두 학습했어요!</AllDoneTitle>
          <AllDoneDesc>{"이 단어장의 모든 단어를\n이미 학습 완료했습니다."}</AllDoneDesc>
          <Button
            label="복습하기"
            color="main"
            bg="brand"
            onClick={() => setIsReview(true)}
          />
          <Button
            label="단어장으로 돌아가기"
            color="font"
            bg="main"
            onClick={() => navigate(`/voca/${profile.selected}`)}
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
        <Card />
      </Suspense>
    </Wrapper>
  );
};


