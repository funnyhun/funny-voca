import { Button } from "@app/components";
import { Wrapper, StepButtons, PrevIcon, NextIcon } from "./Pannel.styles";

export const Pannel = ({ changeEvent, prevEvent, nextEvent }) => {
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
      <Button label={"뒤집기"} color={"bg_main"} bg={"success"} onClick={changeEvent} />
      <StepButtons>
        <Button label={buttonLabels.left} color="bg_main" bg="brand" onClick={prevEvent} />
        <Button label={buttonLabels.right} color="bg_main" bg="brand" onClick={nextEvent} />
      </StepButtons>
    </Wrapper>
  );
};

