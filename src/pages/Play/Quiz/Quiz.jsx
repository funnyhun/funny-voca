import styled from "styled-components";
import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useVoca } from "../../../hooks/useVoca";

import { useStep } from "../../../hooks/useMyParam";

import { PlayProgressBar } from "../PlayProgressBar";
import { QuizSelection } from "./QuizSelection";
import { QuizPannel } from "./QuizPannel";
import { Complete } from "./Complete";

const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: space-between;
`;

const Content = styled.div`
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;

  font-size: 1rem;
  color: ${({ theme }) => theme.font};
  font-weight: 600;

  background-color: ${({ theme }) => theme.main};
`;

export const Quiz = () => {
  const { quizs } = useOutletContext();
  const { step } = useStep();
  const [isCorrect, setIsCorrect] = useState(false);
  const { updateVoca } = useVoca();

  const currentQuiz = quizs[step];

  const quizData = useMemo(() => {
    if (!currentQuiz) return null;

    const { definitions, word } = currentQuiz;
    if (!definitions || definitions.length === 0) return null;

    const def = definitions[0];
    const question = def.quiz_en && def.quiz_en.length > 0 
      ? def.quiz_en[Math.floor(Math.random() * def.quiz_en.length)] 
      : `[ ] : ${def.value}`;
    
    const answer = word;
    
    const wrongs = quizs
      .filter((q) => q.word !== answer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((q) => q.word);

    while (wrongs.length < 3) {
      wrongs.push("---");
    }

    return { question, answer, wrongs };
  }, [currentQuiz, step]);

  if (step >= quizs.length) {
    return <Complete />;
  }

  if (!currentQuiz || !quizData) return <div>퀴즈 데이터가 없습니다.</div>;

  const { question, answer, wrongs } = quizData;

  const handleCorrect = async () => {
    setIsCorrect(true);
    await updateVoca(currentQuiz.id, true);
  };

  return (
    <Wrapper key={step}>
      <PlayProgressBar total={quizs.length} done={step} />
      <Content>{question}</Content>
      <QuizSelection onClick={handleCorrect} wrongs={wrongs} answer={answer} disabled={isCorrect} />
      {isCorrect && <QuizPannel />}
    </Wrapper>
  );
};

