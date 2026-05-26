import styled from "styled-components";

export const Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;

  overflow-y: auto;

  & > :first-child {
    margin-top: 1rem;
  }

  & > :last-child {
    margin-bottom: 1rem;
  }
`;
