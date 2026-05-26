import styled from "styled-components";

export const Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding-top: 0rem 1rem;

  overflow-y: auto;

  & > :first-child {
    margin-top: 1rem;
  }

  & > :last-child {
    margin-bottom: 1rem;
  }
`;
