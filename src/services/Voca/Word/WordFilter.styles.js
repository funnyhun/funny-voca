import styled from "styled-components";

export const Wrapper = styled.ul`
  height: max-content;
  display: flex;
  flex: 0 0 auto;
  gap: 1rem;

  margin-right: -1rem;

  overflow-x: auto;

  & > :last-child {
    margin-right: 1rem;
  }
`;

export const FilterItem = styled.li`
  display: flex;
  flex: 0 0 auto;
  color: ${({ $selected, theme }) => ($selected ? theme.main : theme.label)};

  background-color: ${({ $selected, theme }) => ($selected ? theme.brand : theme.main)};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
`;
