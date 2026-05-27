import styled from "styled-components";

export const Layout = styled.div`
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
`;

export const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  max-width: ${({ theme }) => theme.max_width};
  background-color: var(--bg-color);

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 auto;

  overflow-y: auto;
`;
