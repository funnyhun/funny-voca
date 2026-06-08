import styled, { keyframes } from "styled-components";

export const TimerWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Svg = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);

  shape-rendering: geometricPrecision;
`;

export const BackgroundCircle = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.text_muted};
  stroke-width: 6;
`;

export const progress = keyframes`
  from {
    stroke-dashoffset: 282.6;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

export const ProgressCircle = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.success_lite};
  stroke-width: 6;
  stroke-linecap: round;

  stroke-dasharray: 282.6;

  animation: ${progress} ${({ $duration }) => $duration}s linear forwards;
`;
