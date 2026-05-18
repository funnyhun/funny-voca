import styled from "styled-components";
import { Button } from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import { useSelected } from "../../../hooks/useMyParam";
import { useEffect } from "react";
import { useStats } from "../../../hooks/useStats";

const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  padding-bottom: 1rem;
`;

const Image = styled.div`
  width: 13rem;
  height: 15rem;

  background-color: ${({ theme }) => theme.brand};
  border-radius: 1rem;

  margin: 0rem 10rem;
`;

const Title = styled.h3`
  font-weight: 600;

  padding-top: 0.5rem;
`;

const Content = styled.div`
  color: ${({ theme }) => theme.label};
  text-align: center;
  line-height: 2;
  white-space: pre-wrap;
`;

const Pannel = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin-top: auto;
`;

export const Complete = ({ replayCard }) => {
  const navigate = useNavigate();
  const { selected } = useSelected();
  const { updateStats } = useStats();

  useEffect(() => {
    updateStats();
  }, []);

  const navigateQuiz = () => navigate(`/play/${selected}/quiz/0`);

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
