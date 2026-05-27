import { useOverlay } from "@/app/context/OverlayContext";
import * as S from "./Overlay.styles";

/**
 * Overlay
 *
 * OverlayContext의 isOverlay 상태를 구독하여 Layout 내부 영역만 덮는 Dimmed + Blur 레이어를 ON/OFF합니다.
 */
export const Overlay = () => {
  const { isOverlay } = useOverlay();

  return <S.Layer $active={isOverlay} />;
};
