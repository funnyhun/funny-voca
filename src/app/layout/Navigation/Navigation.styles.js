import styled from "styled-components";

export const Wrapper = styled.ul`
  width: 100%;
  height: 3.5rem;
  background-color: ${({ theme }) => theme.bg_main};

  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const Item = styled.li`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;

  list-style: none;
  line-height: 1;
  font-size: 0.6rem;
  font-weight: ${({ $located }) => ($located ? 600 : 300)};

  cursor: pointer;
  transition: all 0.2s ease-in-out;

  color: ${({ $located, theme }) => ($located ? theme.brand : theme.text_muted)};

  & > svg {
    fill: ${({ $located, theme }) => ($located ? theme.brand : theme.text_muted)};
  }
`;
