import styled from "styled-components";
import { useContext } from "react";
import { VocaContext, StatsContext, AppContext } from "../../App";

import { Calendar } from "./Calendar";
import { StatsDashboard } from "./StatsDashboard";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding: 1rem 1rem;
  padding-bottom: 1rem;
`;

export const Home = () => {
  const { wordMap } = useContext(VocaContext);
  const { userData } = useContext(StatsContext);
  const { now } = useContext(AppContext);

  return (
    <Wrapper>
      <StatsDashboard userData={userData} wordMap={wordMap} />
      <Calendar mode={"compact"} now={now} userData={userData} wordMap={wordMap} />
    </Wrapper>
  );
};

