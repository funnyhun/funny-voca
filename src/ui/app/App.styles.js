import styled from "styled-components";

export const Layout = styled.div`
  min-width: ${({ theme }) => theme.min_width};
  max-width: ${({ theme }) => theme.max_width};
  margin: 0 auto;
`;

export const Wrapper = styled.div`
  height: 100dvh;

  background-color: ${({ theme }) => theme.background};

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  padding-top: calc(2.8rem + env(safe-area-inset-top, 0px));
  padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px));
  margin: 0 auto;

  overflow-y: auto;
`;
