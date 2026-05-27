import styled from "styled-components";
import { RightIcon, CheckCircleIcon } from "@/assets/iconList";

export const Wrapper = styled.div`
  max-width: ${({ theme }) => theme.max_width};
  min-width: ${({ theme }) => theme.min_width};
  width: 100%;
  height: 3.8rem;

  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 0.5rem;

  background-color: ${({ theme }) => theme.main};

  margin: 0 auto;
  padding: 0.5rem 1rem;
`;

export const Text = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;

  margin-right: 6rem;
`;

export const CheckIcon = styled(CheckCircleIcon)`
  width: 1rem;
  height: 1rem;
  color: ${({ theme }) => theme.week_success};
`;

export const Content = styled.span`
  display: flex;
  align-items: center;
  gap: 0.1rem;

  color: ${({ theme }) => theme.week_success};
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1rem;
`;

export const Label = styled.span`
  color: ${({ theme }) => theme.label};
  font-size: 0.7rem;
`;

export const NextIcon = styled(RightIcon)`
  margin-right: -1rem;
`;
