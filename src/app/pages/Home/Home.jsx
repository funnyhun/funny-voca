import { useOutletContext } from "react-router-dom";

import { Calendar } from "./Calendar/Calendar";
import { StatsDashboard } from "./StatsDashboard/StatsDashboard";
import { Wrapper } from "./Home.styles";

export const Home = () => {
  const { vocaState, statsState, now } = useOutletContext();
  const { voca } = vocaState;
  const { profile } = statsState;

  return (
    <Wrapper>
      <StatsDashboard profile={profile} voca={voca} statsState={statsState} />
      <Calendar mode={"compact"} now={now} profile={profile} voca={voca} />
    </Wrapper>
  );
};


