import React from "react";
import styled from "styled-components";
import { Skeleton } from "../Skeleton";

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  padding: 1.25rem;
`;

const HeaderContainer = styled.div`
  width: 100%;
  margin-bottom: 1.25rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
`;

const Content = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding: 2.5rem 1.25rem;
  background-color: ${({ theme }) => theme.bg_main};
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.25rem;
`;

export const SkeletonQuiz = () => {
  return (
    <Wrapper>
      <HeaderContainer>
        <Skeleton height="0.75rem" width="100%" />
        <TitleWrapper>
          <Skeleton height="1.25rem" width="12.5rem" />
        </TitleWrapper>
      </HeaderContainer>

      <Content>
        <Skeleton height="1.5rem" width="9.375rem" />
        <Skeleton height="3.75rem" width="100%" />
        <OptionContainer>
          <Skeleton height="3.125rem" width="100%" />
          <Skeleton height="3.125rem" width="100%" />
          <Skeleton height="3.125rem" width="100%" />
        </OptionContainer>
      </Content>
    </Wrapper>
  );
};
