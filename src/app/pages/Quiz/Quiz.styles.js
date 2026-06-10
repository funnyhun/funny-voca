import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  padding: 1.25rem;
`;

export const Content = styled.div`
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;

  font-size: 1rem;
  color: ${({ theme }) => theme.text_main};
  font-weight: 600;

  background-color: ${({ theme }) => theme.bg_main};
`;

export const NoQuizWrapper = styled(Wrapper)`
  justify-content: center;
  align-items: center;
`;

export const PhaseTitle = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.brand || "#4F46E5"};
`;

export const ContentInner = styled.div`
  width: 100%;
  padding: 1.25rem;
`;

