import React, { useState, useEffect } from "react";
import * as S from "./Spinner.styles";

export const Spinner = ({ fullScreen = false, message, status }) => {
  const [progress, setProgress] = useState(status ?? 0);

  useEffect(() => {
    if (status !== undefined) {
      setProgress(status);
      return;
    }

    // status가 없을 경우, 자연스러운 틱 애니메이션으로 진행률 채움 (0% -> 98% 대기)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        // 전반부에는 좀 더 빠르고 동적으로, 후반부에는 서서히 채워지도록 설정
        const diff = prev < 50
          ? Math.floor(Math.random() * 8) + 4
          : Math.floor(Math.random() * 3) + 1;
        return Math.min(prev + diff, 98);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <S.Overlay $fullScreen={fullScreen}>
      {message && <S.Message>{message}</S.Message>}
      <S.ProgressBar $fullScreen={fullScreen}>
        <S.ProgressFill $fullScreen={fullScreen} $value={progress} />
      </S.ProgressBar>
      <S.PercentText>{progress}%</S.PercentText>
    </S.Overlay>
  );
};

