import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useWord } from "@app/hooks";

export const useItem = () => {
  const { vocaState, statsState } = useOutletContext();
  const { updateStatus } = vocaState;
  const { profile } = statsState;

  const { words } = useWord();

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
    if (step === words.length - 1) {
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
    total: words.length,
    done: step,
    wordSet: words[step],
    events: { changeMode, prevCard, nextCard, replayCard },
  };
};


