import { useState, useEffect } from "react";
import { useOverlay } from "@/app/context/OverlayContext";
import * as S from "./Spinner.styles";

export const Spinner = ({ message, status }) => {
  const [progress, setProgress] = useState(status ?? 0);
  const { setIsOverlay } = useOverlay();

  // 마운트 시 오버레이 활성화, 언마운트 시 자동 해제
  useEffect(() => {
    setIsOverlay(true);
    return () => setIsOverlay(false);
  }, [setIsOverlay]);

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
    <S.Content>
      {message && <S.Message>{message}</S.Message>}
      <S.ProgressBar>
        <S.ProgressFill $value={progress} />
      </S.ProgressBar>
      <S.PercentText>{progress}%</S.PercentText>
    </S.Content>
  );
};

