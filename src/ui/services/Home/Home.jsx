import { useContext } from "react";
import { VocaContext, StatsContext, AppContext } from "@/ui/app/App";

import { Calendar } from "@/ui/services/Home/Calendar";
import { StatsDashboard } from "@/ui/services/Home/StatsDashboard";
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


