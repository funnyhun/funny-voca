import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  height: 2.8rem;

  padding-left: 1rem;
  padding-right: 1rem;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: ${({ theme }) => theme.bg_main};
  position: relative;
`;

export const ProgressBar = styled.div.attrs(({ $width, $visible }) => ({
  style: {
    width: `${$width}%`,
    opacity: $visible ? 1 : 0,
  },
}))`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: ${({ theme }) => theme.brand || "#4f46e5"};
  transition: width 0.3s ease-out, opacity 0.5s ease-in-out;
  z-index: 9999;
  pointer-events: none;
`;

export const Title = styled.h1`
  line-height: 1;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1rem;

  cursor: pointer;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const NotificationBtn = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  background-color: ${({ theme, $hasUnread }) => ($hasUnread ? theme.brand : theme.text_muted)};
  border-radius: 50%;
  cursor: pointer;
  position: relative;
`;
