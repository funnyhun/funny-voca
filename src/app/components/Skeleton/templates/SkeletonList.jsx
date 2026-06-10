import React from "react";
import styled from "styled-components";
import { Skeleton } from "../Skeleton";

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-bottom: 0.0625rem solid ${({ theme }) => theme.text_muted};
`;

export const SkeletonList = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <ItemContainer key={i}>
          <Skeleton height="1.25rem" width="7.5rem" />
          <Skeleton height="1rem" width="12.5rem" />
        </ItemContainer>
      ))}
    </>
  );
};
