import styled, { css } from "styled-components";
import { OVERLAY_DIM_ALPHA } from "@/app/context/OverlayContext";

export const Layer = styled.div`
  position: absolute;
  top: env(safe-area-inset-top, 0px); /* S.Layout의 padding-top 영역 침범 차단 */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;

  pointer-events: none;
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  background-color: transparent;

  transition:
    opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $active }) =>
    $active &&
    css`
      pointer-events: auto;
      opacity: 1;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      background-color: rgba(0, 0, 0, ${OVERLAY_DIM_ALPHA});
    `}
`;
