import { useState, useEffect } from "react";
import * as S from "./CircleTimer.styles";
import { NumberDisplay } from "./NumberDisplay";

export const CircleTimer = ({ second = 3, callback }) => {
  useEffect(() => {
    let timerId;

    const startTimer = () => {
      timerId = setTimeout(() => {
        callback();
      }, second * 1000);
    };

    startTimer();

    return () => {
      clearTimeout(timerId);
    };
  }, [second, callback]);

  return (
    <S.TimerWrapper>
      <S.Svg viewBox="0 0 100 100">
        <S.BackgroundCircle cx="50" cy="50" r="45" />
        <S.ProgressCircle cx="50" cy="50" r="45" $duration={second} />
      </S.Svg>
      <NumberDisplay second={second} />
    </S.TimerWrapper>
  );
};
