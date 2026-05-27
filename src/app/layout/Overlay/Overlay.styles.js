import styled, { css } from "styled-components";
import { OVERLAY_DIM_ALPHA } from "@/app/context/OverlayContext";

export const Layer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 100;

  pointer-events: none;
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  background-color: transparent;

  transition:
    opacity 0.35s ease,
    backdrop-filter 0.35s ease,
    background-color 0.35s ease;

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
