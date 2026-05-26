import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 1rem 1rem;
  padding-bottom: 1rem;
`;

export const AllDoneWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  text-align: center;
`;

export const AllDoneTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.font};
`;

export const AllDoneDesc = styled.p`
  color: ${({ theme }) => theme.label};
  line-height: 1.8;
  white-space: pre-line;
`;
