import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font};
`;

export const UserInfo = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.main};
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.label};
`;

export const Value = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.font};
`;

export const LevelButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const LevelButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.brand : "transparent")};
  background-color: ${({ theme, $active }) => ($active ? theme.week : theme.main)};
  color: ${({ theme, $active }) => ($active ? theme.brand : theme.font)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;


