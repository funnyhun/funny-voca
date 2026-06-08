import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.text_sub};
  text-align: center;
`;

export const Emoji = styled.span`
  font-size: 2.5rem;
`;

export const Message = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
`;
