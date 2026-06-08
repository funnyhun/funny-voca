import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

export const Base = styled.div`
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "20px"};
  border-radius: ${({ $variant }) => ($variant === "circle" ? "50%" : "0.375rem")};
  
  /* 테마 컬러에 어울리는 쉬머 백그라운드 색상 선택 */
  background: linear-gradient(
    90deg,
    ${({ theme }) => (theme.bg_main === "#000000" ? "#222" : "#e0e0e0")} 25%,
    ${({ theme }) => (theme.bg_main === "#000000" ? "#333" : "#f0f0f0")} 37%,
    ${({ theme }) => (theme.bg_main === "#000000" ? "#222" : "#e0e0e0")} 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.4s ease infinite;
  
  display: inline-block;
`;
