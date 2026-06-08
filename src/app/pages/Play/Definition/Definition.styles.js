import styled from "styled-components";

export const Example = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text_sub};
  font-size: 1rem;
  font-weight: 500;
`;

export const Value = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text_muted};
  font-size: 1.5rem;
  font-weight: 500;
`;
