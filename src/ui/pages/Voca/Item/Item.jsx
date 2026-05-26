import * as S from "./Item.styles";
import { ProgressBar } from "../ProgressBar";
import { useSelected } from "@/ui/hooks";

export const Item = ({ item, isStudying }) => {
  const { id, length, done, progress } = item;
  const { changeSelected } = useSelected();

  const navItemDetail = () => {
    changeSelected(id);
  };

  return (
    <S.Wrapper $isStudying={isStudying}>
      <S.Status $status={done}>{done ? <S.CompleteIcon /> : <S.IncompleteIcon />}</S.Status>
      <S.Content>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <S.Label>{`Day ${id + 1}`}</S.Label>
          {isStudying && (
            <span style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#ffffff",
              fontSize: "0.65rem",
              fontWeight: "600",
              padding: "0.15rem 0.4rem",
              borderRadius: "6px",
              whiteSpace: "nowrap"
            }}>학습 중</span>
          )}
        </div>
        <S.Length>{`단어 ${length}개`}</S.Length>
      </S.Content>
      <ProgressBar status={progress} />
      <S.NextButton onClick={navItemDetail} />
    </S.Wrapper>
  );
};
