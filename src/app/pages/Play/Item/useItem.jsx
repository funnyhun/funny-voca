import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStep, useSelected, useWord } from "@app/hooks";

export const useItem = () => {
  const { vocaState } = useOutletContext();
  const { updateStatus } = vocaState;
  const { selected } = useSelected();
  const { words } = useWord(selected);
  const { step, changeStep } = useStep();
  const [mode, setMode] = useState("word");

  const changeMode = () => {
    setMode((prev) => (prev === "word" ? "def" : "word"));
  };

  const prevCard = () => {
    if (step === 0) return;
    changeStep(step - 1);
  };

  const nextCard = () => {
    if (step === words.length - 1) {
      setMode("complete");
      return;
    }
    changeStep(step + 1);
  };

  const replayCard = () => {
    changeStep(0);
  };

  return {
    mode,
    total: words.length,
    done: step,
    wordSet: words[step],
    events: { changeMode, prevCard, nextCard, replayCard },
  };
};


