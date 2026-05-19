import * as S from "./Quiz.styles";
import { useState, useMemo, useContext } from "react";
import { VocaContext } from "@/ui/app/App";
import { useStep, useSelected } from "@/ui/common/hooks/useMyParam";
import { useWord } from "@/ui/common/hooks/useWord";
import { shuffleArray } from "@/common/utils/utils";

import { PlayProgressBar } from "@/ui/services/Play/PlayProgressBar";
import { QuizSelection } from "./QuizSelection";
import { QuizPannel } from "./QuizPannel";
import { Complete } from "./Complete";

export const Quiz = () => {
  const { selected } = useSelected();
  const { words } = useWord(selected);
  const { step } = useStep();
  const [isCorrect, setIsCorrect] = useState(false);
  const { updateStatus } = useContext(VocaContext);

  // 퀴즈 섞기: selected/words 변경 시에만 처음 미완료 단어 리스트를 고정합니다.
  const quizs = useMemo(() => {
    return shuffleArray([...words]).filter((w) => w.done === false);
  }, [words]);

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
  }, [currentQuiz, step, quizs]);

  if (step >= quizs.length) {
    return <Complete />;
  }

  if (!currentQuiz || !quizData) return <div>퀴즈 데이터가 없습니다.</div>;

  const { question, answer, wrongs } = quizData;

  const handleCorrect = () => {
    setIsCorrect(true);
    updateStatus(currentQuiz.id, true);
  };


  return (
    <S.Wrapper key={step}>
      <PlayProgressBar total={quizs.length} done={step} />
      <S.Content>{question}</S.Content>
      <QuizSelection onClick={handleCorrect} wrongs={wrongs} answer={answer} disabled={isCorrect} />
      {isCorrect && <QuizPannel />}
    </S.Wrapper>
  );
};


