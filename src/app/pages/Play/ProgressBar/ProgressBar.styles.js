import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

export const Step = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
  color: ${({ theme }) => theme.label};
`;
