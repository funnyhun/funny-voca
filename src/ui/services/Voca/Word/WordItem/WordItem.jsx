import * as S from "./WordItem.styles";
import { useState, useContext } from "react";

import { VocaContext } from "@/ui/app/App";
import { WordDetail } from "@/ui/services/Voca/Word/WordDetail";

export const WordItem = ({ word }) => {
  const { word: label, definitions, done, id } = word;
  const [showDetail, setShowDetail] = useState(false);
  const { updateStatus } = useContext(VocaContext);

  const handleToggle = () => {
    updateStatus(id, !done);
  };

  return (
    <>
      <S.Wrapper>
        <S.Status $status={done} onClick={handleToggle} style={{ cursor: "pointer" }}>
          {done ? <S.CompleteIcon /> : <S.InCompleteIcon />}
        </S.Status>
        <S.Content>
          <S.Label>{label}</S.Label>
          <S.Explain>{`${definitions[0].class}.${definitions[0].value}`}</S.Explain>
        </S.Content>
        <S.MoreButton onClick={() => setShowDetail(true)} />
      </S.Wrapper>
      {showDetail && <WordDetail word={word} onClose={() => setShowDetail(false)} />}
    </>
  );
};
