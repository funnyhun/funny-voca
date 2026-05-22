import styled from "styled-components";

export const Wrapper = styled.div`
  min-width: ${({ theme }) => theme.min_width};

  height: 100dvh;

  padding-top: calc(env(safe-area-inset-top, 0px) + 1rem);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: ${({ theme }) => theme.background};

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  margin: 0 auto;

  overflow-y: auto;
`;
