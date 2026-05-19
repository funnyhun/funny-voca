import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  padding-top: 2rem;
`;

export const Image = styled.div`
  width: 10rem;
  height: 10rem;

  background-color: ${({ theme }) => theme.week};
  border-radius: 5rem;
`;

export const Greet = styled.p`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.1rem;

  white-space: pre-line;
`;

export const Content = styled.p`
  color: ${({ theme }) => theme.label};
  text-align: center;
  line-height: 1.7;

  white-space: pre-line;
`;

export const LevelSelection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

export const ProgressUI = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
`;

export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 0rem 0.2rem;
`;

export const ProgressTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.brand};
`;

export const ProgressStatus = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font};
`;
