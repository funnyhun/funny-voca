import { ProgressBar } from "@/ui/common";
import { Wrapper, Step } from "./PlayProgressBar.styles";

export const PlayProgressBar = ({ total, done }) => {
  return (
    <Wrapper>
      <Step>{`${done} / ${total}`}</Step>
      <ProgressBar status={(done / total) * 100} />
    </Wrapper>
  );
};

