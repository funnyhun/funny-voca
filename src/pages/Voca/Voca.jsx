import styled from "styled-components";
import { Outlet } from "react-router-dom";

const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 0rem 1rem;
`;

export const Voca = () => {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
};

