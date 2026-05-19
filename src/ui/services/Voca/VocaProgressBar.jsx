import * as S from "./VocaProgressBar.styles";
import { SmallProgressBar } from "@/ui/common";

export const VocaProgressBar = ({ status }) => {
  return (
    <S.Wrapper>
      <S.Percentage>{`${status}%`}</S.Percentage>
      <SmallProgressBar status={status} />
    </S.Wrapper>
  );
};
