import { useMemo } from "react";
import { QuizSelection } from "../QuizSelection";
import { getWrongWords } from "../utils";

export const SpellingQuiz = ({ currentWord, allWords, onCorrect, onWrong, isAnswered }) => {
  const definition = currentWord.definitions?.[0] || {};
  const question = definition.value || "뜻 정보가 없습니다.";
  const answer = currentWord.word;

  const wrongs = useMemo(() => {
    return getWrongWords(answer, allWords);
  }, [answer, allWords]);

  return (
    <>
      <div style={{ textAlign: "center", fontSize: "1.2rem", color: "#666", marginBottom: "8px" }}>
        의미에 알맞은 단어를 선택하세요.
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: "bold", textAlign: "center", margin: "24px 0" }}>
        {question}
      </div>
      <QuizSelection
        onClick={onCorrect}
        onWrong={onWrong}
        wrongs={wrongs}
        answer={answer}
        disabled={isAnswered}
      />
    </>
  );
};
