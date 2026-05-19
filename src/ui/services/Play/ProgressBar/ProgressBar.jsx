import { ProgressBar as Gauge } from "@/ui/common";
import * as S from "./ProgressBar.styles";

export const ProgressBar = ({ total, done }) => {
  return (
    <S.Wrapper>
      <S.Step>{`${done} / ${total}`}</S.Step>
      <Gauge status={total > 0 ? (done / total) * 100 : 0} />
    </S.Wrapper>
  );
};
