import { useOutletContext } from "react-router-dom";

import { Calendar } from "./Calendar";
import { StatsDashboard } from "./StatsDashboard";
import { Wrapper } from "./Home.styles";

export const Home = () => {
  const { vocaState, statsState, now } = useOutletContext();
  const { wordMap } = vocaState;
  const { userData } = statsState;

  return (
    <Wrapper>
      <StatsDashboard userData={userData} wordMap={wordMap} />
      <Calendar mode={"compact"} now={now} userData={userData} wordMap={wordMap} />
    </Wrapper>
  );
};


