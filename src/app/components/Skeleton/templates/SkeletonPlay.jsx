import React from "react";
import styled from "styled-components";
import { Skeleton } from "../Skeleton";
import { BorderBox } from "@app/components";

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
`;

const HeaderContainer = styled.div`
  width: 100%;
  margin-bottom: 0.5rem;
`;

const AudioWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;

const CustomBorderBox = styled(BorderBox)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  min-height: 15rem;
`;

const PannelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
`;

const StepButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

export const SkeletonPlay = () => {
  return (
    <Wrapper>
      <HeaderContainer>
        <Skeleton height="0.75rem" width="100%" />
      </HeaderContainer>

      <AudioWrapper>
        <Skeleton height="2.5rem" width="2.5rem" variant="circle" />
      </AudioWrapper>

      <CustomBorderBox>
        <Skeleton height="2.5rem" width="60%" />
      </CustomBorderBox>

      <PannelWrapper>
        <Skeleton height="3.125rem" width="100%" />
        <StepButtons>
          <Skeleton height="3.125rem" width="100%" />
          <Skeleton height="3.125rem" width="100%" />
        </StepButtons>
      </PannelWrapper>
    </Wrapper>
  );
};
