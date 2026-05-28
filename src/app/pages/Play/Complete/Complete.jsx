import { Button } from "@app/components";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { Wrapper, Image, Title, Content, Pannel } from "./Complete.styles";

export const Complete = ({ replayCard }) => {
  const navigate = useNavigate();
  const { statsState } = useOutletContext();
  const { profile, recordSession } = statsState;

  useEffect(() => {
    recordSession();
  }, [recordSession]);

  const navigateQuiz = () => navigate("/quiz");

  return (
    <Wrapper>
      <Image />
      <Title>학습 완료!</Title>
      <Content>{"오늘의 단어를 모두 확인했습니다.\n퀴즈로 이동할까요?"}</Content>
      <Pannel>
        <Button label="퀴즈 풀러가기" color="main" bg="brand" onClick={navigateQuiz} />
        <Button label="다시 학습하기" color="font" bg="main" onClick={replayCard} />
      </Pannel>
    </Wrapper>
  );
};


