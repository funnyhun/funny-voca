import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;

  padding: 0.1rem;
`;

export const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.label};
`;

export const CustomInput = styled.input`
  padding: 0.5rem 1rem;
  padding-left: ${({ $hasIcon }) => ($hasIcon ? "2rem" : "0.5rem")};

  border: ${({ $isBorder, theme }) => ($isBorder ? `0.1rem solid ${theme.sub}` : "none")};
  border-radius: 0.5rem;

  &:focus {
    outline: ${({ $isOutline, theme }) => ($isOutline ? `0.1rem solid ${theme.label}` : "none")};
  }

  &::placeholder {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.sub};
  }
`;

export const Notice = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.label};
  padding-left: 0.2rem;
`;

export const IconWrapper = styled.div`
  position: absolute;
  left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none;
`;
