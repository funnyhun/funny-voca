import * as S from "./QuizPannel.styles";
import { useStep } from "@/ui/common/hooks/useMyParam";
import { CircleTimer } from "./CircleTimer";
import { SmallButton } from "@/ui/common";

export const QuizPannel = ({ disable }) => {
  const { step, changeStep } = useStep();

  const navNextQuiz = () => {
    changeStep(step + 1);
  };

  return (
    <S.Wrapper>
      <CircleTimer second={3} callback={navNextQuiz} />
      <S.Text>
        <S.Content>
          <S.CheckIcon />
          정답입니다!
        </S.Content>
        <S.Label>3초 뒤 자동으로 전환</S.Label>
      </S.Text>
      <SmallButton
        label={
          <>
            다음
            <S.NextIcon />
          </>
        }
        color="main"
        bg="brand"
        onClick={navNextQuiz}
      />
    </S.Wrapper>
  );
};
