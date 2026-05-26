import * as S from "./ProgressBar.styles";
import { SmallProgressBar } from "@/ui/components";

export const ProgressBar = ({ status }) => {
  return (
    <S.Wrapper>
      <S.Percentage>{`${status}%`}</S.Percentage>
      <SmallProgressBar status={status} />
    </S.Wrapper>
  );
};
