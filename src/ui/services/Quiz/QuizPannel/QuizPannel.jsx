import * as S from "./QuizPannel.styles";
import { CircleTimer } from "@/ui/services/Quiz/CircleTimer";
import { SmallButton } from "@/ui/common";

export const QuizPannel = ({ onNext }) => {
  return (
    <S.Wrapper>
      <CircleTimer second={3} callback={onNext} />
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
        onClick={onNext}
      />
    </S.Wrapper>
  );
};
