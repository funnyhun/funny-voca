import styled from "styled-components";
import { useContext } from "react";
import { VocaContext } from "../../App";

import { VocaItem } from "./VocaItem";

const Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding-top: 0rem 1rem;

  overflow-y: auto;

  & > :first-child {
    margin-top: 1rem;
  }

  & > :last-child {
    margin-bottom: 1rem;
  }
`;

export const VocaList = () => {
  const { wordMap } = useContext(VocaContext);

  return (
    <Wrapper>
      {wordMap.filter(Boolean).map((item, i) => {
        return <VocaItem item={item} key={i} />;
      })}
    </Wrapper>
  );
};

