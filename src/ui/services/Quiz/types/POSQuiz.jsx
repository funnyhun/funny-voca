import { useMemo } from "react";
import { QuizSelection } from "@/ui/services/Quiz/QuizSelection";
import { toKoreanPOS, getWrongPOS } from "@/ui/services/Quiz/utils";

export const POSQuiz = ({ currentWord, onCorrect, onWrong, isAnswered }) => {
  const word = currentWord.word;
  const rawPOS = currentWord.definitions?.[0]?.type || "n.";
  const answer = toKoreanPOS(rawPOS);

  const wrongs = useMemo(() => {
    return getWrongPOS(rawPOS);
  }, [rawPOS]);

  return (
    <>
      <div style={{ textAlign: "center", fontSize: "1.2rem", color: "#666", marginBottom: "8px" }}>
        단어의 올바른 품사를 선택하세요.
      </div>
      <div style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", margin: "24px 0", letterSpacing: "1px" }}>
        {word}
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
