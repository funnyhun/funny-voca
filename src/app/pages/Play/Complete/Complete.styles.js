import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  padding-bottom: 1rem;
`;

export const Image = styled.div`
  width: 13rem;
  height: 15rem;

  background-color: ${({ theme }) => theme.brand};
  border-radius: 1rem;

  margin: 0rem 10rem;
`;

export const Title = styled.h3`
  font-weight: 600;

  padding-top: 0.5rem;
`;

export const Content = styled.div`
  color: ${({ theme }) => theme.label};
  text-align: center;
  line-height: 2;
  white-space: pre-wrap;
`;

export const Pannel = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin-top: auto;
`;
