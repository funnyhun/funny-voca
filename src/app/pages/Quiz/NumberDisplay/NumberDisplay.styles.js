import styled from "styled-components";

export const Display = styled.span`
  position: absolute;

  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.success_lite};
  line-height: 1;
`;
