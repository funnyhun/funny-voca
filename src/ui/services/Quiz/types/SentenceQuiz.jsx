import { useMemo } from "react";
import { QuizSelection } from "@/ui/services/Quiz/QuizSelection";
import { getWrongWords } from "@/ui/services/Quiz/utils";

export const SentenceQuiz = ({ currentWord, allWords, onCorrect, onWrong, isAnswered }) => {
  const definitions = currentWord.definitions || [];
  const def = definitions[0] || {};
  const answer = currentWord.word;

  const question = useMemo(() => {
    if (def.quiz_en && def.quiz_en.length > 0) {
      const randomIndex = Math.floor(Math.random() * def.quiz_en.length);
      return def.quiz_en[randomIndex];
    }
    return `[  ] : ${def.value || "뜻 정보 없음"}`;
  }, [def]);

  const wrongs = useMemo(() => {
    return getWrongWords(answer, allWords);
  }, [answer, allWords]);

  return (
    <>
      <div style={{ textAlign: "center", fontSize: "1.2rem", color: "#666", marginBottom: "8px" }}>
        문맥에 알맞은 단어를 선택하세요.
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: "600", textAlign: "center", margin: "24px 0", lineHeight: "1.6", wordBreak: "break-word", padding: "0 16px" }}>
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
