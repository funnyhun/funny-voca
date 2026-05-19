import styled from "styled-components";

export const Wrapper = styled.div`
  min-width: ${({ theme }) => theme.min_width};

  // Navigation + ios-bottom-area
  height: calc(100vh - env(safe-area-inset-bottom));

  padding-top: calc(env(safe-area-inset-top) + 1rem);
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: ${({ theme }) => theme.background};

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  margin: 0 auto;

  overflow-y: auto;
`;
