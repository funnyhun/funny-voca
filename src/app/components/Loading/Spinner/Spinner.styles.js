import styled from "styled-components";

export const Overlay = styled.div`
  bottom: 0; 
  height: 100vh;
  height: -webkit-fill-available;
  height: 100dvh;

  z-index: 9999;
  background-color: red;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(8px);
  color: white;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  font-weight: 600;
  font-size: 1rem;
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
  background-color: ${({ $fullScreen }) => ($fullScreen ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)")};
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $value }) => $value}%;
  background-color: ${({ $fullScreen, theme }) => ($fullScreen ? "white" : theme.brand || "#137FEC")};
  transition: width 0.2s ease;
  border-radius: 4px;
`;

export const PercentText = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
`;

