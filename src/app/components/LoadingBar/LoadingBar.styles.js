import styled, { keyframes } from "styled-components";

const slide = keyframes`
  0% {
    left: -100%;
    width: 30%;
  }
  50% {
    width: 60%;
  }
  100% {
    left: 100%;
    width: 30%;
  }
`;

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: rgba(19, 127, 236, 0.15); /* brand 컬러의 15% 반투명 */
  z-index: 99999;
  overflow: hidden;
`;

export const Bar = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.brand || "#137FEC"} 0%,
    ${({ theme }) => theme.success_lite || "#7ED321"} 50%,
    ${({ theme }) => theme.brand || "#137FEC"} 100%
  );
  box-shadow: 0 0 8px ${({ theme }) => theme.brand || "#137FEC"};
  animation: ${slide} 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
`;
