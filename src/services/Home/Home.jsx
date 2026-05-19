import { useContext } from "react";
import { VocaContext, StatsContext, AppContext } from "@/app/App";

import { Calendar } from "./Calendar";
import { StatsDashboard } from "./StatsDashboard";
import { Wrapper } from "./Home.styles";

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


