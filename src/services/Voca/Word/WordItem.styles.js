import styled from "styled-components";
import { CheckCircleIcon, WordIcon, MoreVIcon } from "@/common/assets/iconList";

export const Wrapper = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background-color: ${({ theme }) => theme.main};

  padding: 1rem;
  border-radius: 0.5rem;
`;

export const CompleteIcon = styled(CheckCircleIcon)`
  color: ${({ theme }) => theme.main};
`;

export const InCompleteIcon = styled(WordIcon)`
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
  font-weight: 600;
`;

export const Explain = styled.span`
  color: ${({ theme }) => theme.label};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.3rem;

  margin-left: 0.5rem;
`;

export const MoreButton = styled(MoreVIcon)`
  margin-left: auto;
  cursor: pointer;
  flex-shrink: 0;
`;
