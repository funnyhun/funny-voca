import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useItem } from "./useItem";
import { ProgressBar } from "../ProgressBar";
import { Definition } from "../Definition";
import { Complete } from "../Complete";
import { Pannel } from "../Pannel";
import { AudioButton, CustomBorderBox, Title } from "./Item.styles";

const createAudio = () => {
  const audio = new SpeechSynthesisUtterance();

  audio.lang = "en-US";
  audio.rate = 0.9;

  return audio;
};

export const Item = () => {
  const { mode, total, done, wordSet, events } = useItem();

  const { changeMode, prevCard, nextCard, replayCard } = events;

  // wordSet이 없는 경우 (데이터 로딩 중 혹은 빈 Day) 렌더링 건너뜀
  if (!wordSet) return null;

  const { word, definitions } = wordSet;

  const AUDIO = useMemo(() => createAudio(), []);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  });

  const playAudio = () => {
    window.speechSynthesis.cancel();

    AUDIO.text = word;

    window.speechSynthesis.speak(AUDIO);
  };

  const CONTENT = {
    word: <Title $length={word.length}>{word}</Title>,
    def: <Definition definitions={definitions} />,
  };

  return mode !== "complete" ? (
    <>
      <ProgressBar total={total} done={done} />
      <AudioButton onClick={playAudio} />
      <CustomBorderBox>{CONTENT[mode]}</CustomBorderBox>
      <Pannel
        changeEvent={changeMode}
        prevEvent={prevCard}
        nextEvent={nextCard}
      />
    </>
  ) : (
    <Complete replayCard={replayCard} />
  );
};

