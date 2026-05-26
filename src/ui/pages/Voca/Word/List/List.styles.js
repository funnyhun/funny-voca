import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding-top: 1rem;
`;

export const Content = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  overflow-y: auto;

  & > :last-child {
    margin-bottom: 1rem;
  }
`;
