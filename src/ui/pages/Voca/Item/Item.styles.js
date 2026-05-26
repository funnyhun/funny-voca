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
