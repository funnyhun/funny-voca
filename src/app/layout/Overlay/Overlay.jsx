import { useOverlay } from "@/app/context/OverlayContext";
import * as S from "./Overlay.styles";

/**
 * Overlay
 *
 * S.Layout 내부 최상단에 단 1회 선언된다.
 * OverlayContext의 isOverlay 상태를 구독하여 Dimmed + Blur 레이어를 ON/OFF한다.
 * 노치 영역 동기화는 OverlayContext의 useEffect가 전담하므로 이 컴포넌트는 렌더링만 담당한다.
 */
export const Overlay = () => {
  const { isOverlay } = useOverlay();

  return <S.Layer $active={isOverlay} />;
};
