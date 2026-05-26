import { ProgressBar as CommonProgressBar } from "@/ui/components";
import * as S from "./ProgressBar.styles";

export const ProgressBar = ({ total, done }) => {
  return (
    <S.Wrapper>
      <S.Step>{`${done} / ${total}`}</S.Step>
      <CommonProgressBar status={(done / total) * 100} />
    </S.Wrapper>
  );
};
