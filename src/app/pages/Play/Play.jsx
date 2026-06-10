import { useMemo, Suspense, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { useMaster } from "@app/hooks";
import { Button } from "@app/components";
import { Item as Card } from "./Item";
import { withSkeleton } from "@/app/components/HOC";
import { SkeletonPlay } from "@/app/components/Skeleton/templates";
import {
  Wrapper,
  AllDoneWrapper,
  AllDoneTitle,
  AllDoneDesc,
} from "./Play.styles";

const PlayComponent = () => {
  const context = useOutletContext();
  const { statsState } = context;
  const { profile } = statsState;
  const { getChunk } = useMaster();
  const [playWords, setPlayWords] = useState([]);
  const navigate = useNavigate();
  const [isReview, setIsReview] = useState(false);

  const currentVocaId = profile?.selected;

  const { words, isLoaded } = getChunk(currentVocaId);

  // 최초 로드 시 혹은 청크 ID 변경 시에만 깊은 복사본 단어 목록을 격리 고정
  useEffect(() => {
    if (isLoaded && words.length > 0 && playWords.length === 0) {
      setPlayWords(words);
    }
  }, [currentVocaId, isLoaded, words, playWords.length]);

  const remainingQuizs = useMemo(() => {
    return playWords.filter((w) => w.done === false);
  }, [playWords]);

  // 퀴즈 진입 시 모든 단어가 이미 암기 완료인 경우
  const isQuizRoute = window.location.pathname.includes("/quiz");

  if (!isQuizRoute && playWords.length > 0 && remainingQuizs.length === 0 && !isReview) {
    return (
      <Wrapper>
        <AllDoneWrapper>
          <span style={{ fontSize: "3rem" }}>🎉</span>
          <AllDoneTitle>이미 모두 학습했어요!</AllDoneTitle>
          <AllDoneDesc>{"이 단어장의 모든 단어를\n이미 학습 완료했습니다."}</AllDoneDesc>
          <Button
            label="복습하기"
            color="bg_main"
            bg="brand"
            onClick={() => setIsReview(true)}
          />
          <Button
            label="단어장으로 돌아가기"
            color="text_main"
            bg="bg_main"
            onClick={() => navigate(`/voca/${profile.selected}`)}
          />
          <Button
            label="홈으로"
            color="text_main"
            bg="bg_main"
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

export const Play = withSkeleton(PlayComponent, SkeletonPlay);



