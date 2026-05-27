import styled from "styled-components";

/* Overlay 레이어(z-index: 100) 위에 콘텐츠를 중앙 배치한다 */
export const Content = styled.div`
  position: absolute;
  inset: 0;
  z-index: 101;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;

  color: white;
  font-weight: 600;
  font-size: 1rem;

  pointer-events: none;
`;

export const Message = styled.span`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02rem;
  opacity: 0.95;
  text-align: center;
`;

export const ProgressBar = styled.div`
  width: 200px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $value }) => $value}%;
  background-color: white;
  transition: width 0.2s ease;
  border-radius: 4px;
`;

export const PercentText = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
`;
