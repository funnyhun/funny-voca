import styled from "styled-components";

export const BorderBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;

  padding: 1rem;

  text-align: left;
  background-color: ${({ theme }) => theme.main};

  border: 0.1rem solid ${({ theme }) => theme.main};
  border-radius: 0.5rem;
`;

export const BoxGroup = styled.div`
  display: flex;
  gap: 1rem;
`;
