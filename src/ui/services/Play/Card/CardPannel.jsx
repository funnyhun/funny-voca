import { Button } from "@/ui/common";
import { Wrapper, StepButtons, PrevIcon, NextIcon } from "./CardPannel.styles";

export const CardPannel = ({ changeEvent, prevEvent, nextEvent }) => {
  const buttonLabels = {
    left: (
      <>
        <PrevIcon />
        이전
      </>
    ),
    right: (
      <>
        다음
        <NextIcon />
      </>
    ),
  };

  return (
    <Wrapper>
      <Button label={"뒤집기"} color={"main"} bg={"success"} onClick={changeEvent} />
      <StepButtons>
        <Button label={buttonLabels.left} color="main" bg="brand" onClick={prevEvent} />
        <Button label={buttonLabels.right} color="main" bg="brand" onClick={nextEvent} />
      </StepButtons>
    </Wrapper>
  );
};

