import styled from "styled-components";

export const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;

  max-width: ${({ theme }) => theme.max_width};
  min-width: ${({ theme }) => theme.min_width};
  width: 100%;
  height: calc(2.8rem + env(safe-area-inset-top, 0px));

  padding-top: env(safe-area-inset-top, 0px);
  padding-left: 1rem;
  padding-right: 1rem;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: ${({ theme }) => theme.main};
  margin: 0 auto;
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
  background-color: ${({ theme, $hasUnread }) => ($hasUnread ? theme.brand : theme.sub)};
  border-radius: 50%;
  cursor: pointer;
  position: relative;
`;
