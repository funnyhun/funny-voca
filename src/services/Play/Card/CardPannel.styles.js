import styled from "styled-components";
import { LeftIcon, RightIcon } from "@/common/assets/iconList";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding-top: 1rem;

  & p {
    line-height: 1.5;
  }
`;

export const StepButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

export const PrevIcon = styled(LeftIcon)`
  width: 1.2rem;
  height: 1.2rem;
  margin-left: -0.5rem;
`;

export const NextIcon = styled(RightIcon)`
  width: 1.2rem;
  height: 1.2rem;
  margin-right: -0.5rem;
`;
