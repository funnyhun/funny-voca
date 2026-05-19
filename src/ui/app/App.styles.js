import styled from "styled-components";

export const Layout = styled.div`
  min-width: ${({ theme }) => theme.min_width};
  max-width: ${({ theme }) => theme.max_width};
  margin: 0 auto;
`;

export const Wrapper = styled.div`
  // Navigation + ios-bottom-area
  height: calc(100vh - 3.5rem - env(safe-area-inset-bottom));

  background-color: ${({ theme }) => theme.background};

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  padding-top: calc(2.8rem + env(safe-area-inset-top));
  margin: 0 auto;

  overflow-y: auto;
`;
