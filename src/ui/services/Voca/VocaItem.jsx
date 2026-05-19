import * as S from "./VocaItem.styles";
import { VocaProgressBar } from "./VocaProgressBar";
import { useSelected } from "@/ui/common/hooks/useMyParam";

export const VocaItem = ({ item }) => {
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
      <VocaProgressBar status={progress} />
      <S.NextButton onClick={navItemDetail} />
    </S.Wrapper>
  );
};

