import styled from "styled-components";

export const Wrapper = styled.button`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;

  background-color: ${({ $bg, theme }) => theme[$bg]};

  border: 0px;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: auto;

  cursor: pointer;
`;

export const Label = styled.span`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1rem;
  color: ${({ $color, theme }) => theme[$color]};

  & > svg {
    color: ${({ $color, theme }) => theme[$color]};
  }
`;
