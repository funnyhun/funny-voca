import { useState, useEffect } from "react";
import { Selection } from "../Selection";
import { getWrongWords } from "../utils";

export const SpellingQuiz = ({ currentWord, allWords, onCorrect, onWrong, isAnswered }) => {
  const definition = currentWord.definitions?.[0] || {};
  const question = definition.value || "뜻 정보가 없습니다.";
  const answer = currentWord.word;

  const [wrongs, setWrongs] = useState([]);

  useEffect(() => {
    if (currentWord && allWords && allWords.length > 0) {
      setWrongs(getWrongWords(answer, allWords));
    }
  }, [currentWord?.id, answer]);

  return (
    <>
      <div style={{ textAlign: "center", fontSize: "1.2rem", color: "#666", marginBottom: "8px" }}>
        의미에 알맞은 단어를 선택하세요.
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: "bold", textAlign: "center", margin: "24px 0" }}>
        {question}
      </div>
      <Selection
        onClick={onCorrect}
        onWrong={onWrong}
        wrongs={wrongs}
        answer={answer}
        disabled={isAnswered}
      />
    </>
  );
};
