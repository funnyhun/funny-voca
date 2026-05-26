import styled from "styled-components";

export const Display = styled.span`
  position: absolute;

  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.week_success};
  line-height: 1;
`;
