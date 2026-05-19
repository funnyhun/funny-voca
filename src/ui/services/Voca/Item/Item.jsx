import * as S from "./Item.styles";
import { ProgressBar } from "../ProgressBar";
import { useSelected } from "@/ui/common/hooks/useMyParam";

export const Item = ({ item }) => {
  const { id, length, done, progress } = item;
  const { changeSelected } = useSelected();

  const navItemDetail = () => {
    changeSelected(id);
  };

  return (
    <S.Wrapper>
      <S.Status $status={done}>{done ? <S.CompleteIcon /> : <S.IncompleteIcon />}</S.Status>
      <S.Content>
        <S.Label>{`Day ${id + 1}`}</S.Label>
        <S.Length>{`단어 ${length}개`}</S.Length>
      </S.Content>
      <ProgressBar status={progress} />
      <S.NextButton onClick={navItemDetail} />
    </S.Wrapper>
  );
};
