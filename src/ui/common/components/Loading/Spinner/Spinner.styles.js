import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const Overlay = styled.div`
  ${({ $fullScreen }) =>
    $fullScreen
      ? `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      `
      : `
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 150px;
        background: transparent;
      `}
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

export const Circle = styled.div`
  width: ${({ $size }) => $size || "48px"};
  height: ${({ $size }) => $size || "48px"};
  border: 4px solid ${({ theme }) => theme.sub || "#ccc"};
  border-top: 4px solid ${({ theme }) => theme.brand || "#137FEC"};
  border-radius: 50%;
  animation: ${spin} 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
`;

export const Message = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.font};
  opacity: 0.8;
  letter-spacing: -0.02rem;
`;
