import * as S from "./VocaProgressBar.styles";
import { SmallProgressBar } from "@/common/components";

export const VocaProgressBar = ({ status }) => {
  return (
    <S.Wrapper>
      <S.Percentage>{`${status}%`}</S.Percentage>
      <SmallProgressBar status={status} />
    </S.Wrapper>
  );
};
