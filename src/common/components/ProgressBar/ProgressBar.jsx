import { Wrapper, Bar, Progress, SmallBar, SmallProgress } from "./ProgressBar.styles";

export const ProgressBar = ({ status }) => {
  return (
    <Wrapper>
      <Bar />
      <Progress $progress={status} />
    </Wrapper>
  );
};

export const SmallProgressBar = ({ status }) => {
  return (
    <Wrapper>
      <SmallBar />
      <SmallProgress $progress={status} />
    </Wrapper>
  );
};
