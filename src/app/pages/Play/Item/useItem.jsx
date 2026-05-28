import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useWord } from "@app/hooks";

export const useItem = () => {
  const { vocaState, statsState } = useOutletContext();
  const { updateStatus } = vocaState;
  const { profile, updateStep } = statsState;

  const { words } = useWord();

  const isTargetDay = true;
  const initialStep = profile.step || 0;

  const [step, setStep] = useState(initialStep);
  const [mode, setMode] = useState("word");

  const changeMode = () => {
    setMode((prev) => (prev === "word" ? "def" : "word"));
  };

  const prevCard = () => {
    if (step === 0) return;
    const nextStep = step - 1;
    setStep(nextStep);
    if (isTargetDay) updateStep(nextStep);
  };

  const nextCard = () => {
    if (step === words.length - 1) {
      setMode("complete");
      if (isTargetDay) updateStep(0); // 완료 시 단계 리셋
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    if (isTargetDay) updateStep(nextStep);
  };

  const replayCard = () => {
    setStep(0);
    setMode("word");
    if (isTargetDay) updateStep(0);
  };

  return {
    mode,
    total: words.length,
    done: step,
    wordSet: words[step],
    events: { changeMode, prevCard, nextCard, replayCard },
  };
};


