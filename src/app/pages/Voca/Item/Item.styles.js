import styled from "styled-components";
import { CheckCircleIcon, WordIcon, RightIcon } from "@/assets/iconList";

export const Wrapper = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;

  background-color: ${({ theme }) => theme.main};

  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $isStudying, theme }) =>
    $isStudying &&
    `
    border-color: #4f46e5;
    background-image: linear-gradient(
      135deg,
      rgba(79, 70, 229, 0.04) 0%,
      rgba(147, 51, 234, 0.04) 100%
    );
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.08);
  `}

  ${({ $isLocked }) =>
    $isLocked &&
    `
    opacity: 0.6;
    filter: grayscale(30%);
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `}
`;

export const CompleteIcon = styled(CheckCircleIcon)`
  color: ${({ theme }) => theme.main};
`;

export const IncompleteIcon = styled(WordIcon)`
  color: ${({ theme }) => theme.brand};
`;

export const Status = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.week};
  padding: 0.75rem 0.7rem;
  border-radius: 3rem;

  & > svg {
    fill: ${({ $status, theme }) => ($status ? theme.success : theme.brand)};
  }
`;

export const Label = styled.h3`
  font-size: 1rem;
`;

export const Length = styled.span`
  color: ${({ theme }) => theme.label};
  font-size: 0.8rem;
`;

export const Content = styled.div``;

export const NextButton = styled(RightIcon)``;

export const LockButton = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;
