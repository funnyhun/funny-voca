import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useMaster } from "@app/hooks";

export const useItem = () => {
  const { vocaState, statsState } = useOutletContext();
  const { updateStatus } = vocaState;
  const { profile } = statsState;

  const { getChunk } = useMaster();
  const [playWords, setPlayWords] = useState([]);

  const currentVocaId = profile?.selected;

  const { words, isLoaded } = getChunk(currentVocaId);

  // 최초 로드 시 혹은 청크 ID 변경 시에만 깊은 복사본 단어 목록을 격리 고정
  useEffect(() => {
    if (isLoaded && words.length > 0 && playWords.length === 0) {
      setPlayWords(words);
    }
  }, [currentVocaId, isLoaded, words, playWords.length]);

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("word");

  const changeMode = () => {
    setMode((prev) => (prev === "word" ? "def" : "word"));
  };

  const prevCard = () => {
    if (step === 0) return;
    setStep((prev) => prev - 1);
  };

  const nextCard = () => {
    if (step === playWords.length - 1) {
      setMode("complete");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const replayCard = () => {
    setStep(0);
    setMode("word");
  };

  return {
    mode,
    total: playWords.length,
    done: step,
    wordSet: playWords[step],
    events: { changeMode, prevCard, nextCard, replayCard },
  };
};


