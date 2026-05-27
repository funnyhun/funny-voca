import * as S from "./Item.styles";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

import { Detail } from "../Detail";
import { clickableProps } from "@/utils/accessibility";

export const Item = ({ word }) => {
  const { word: label, definitions, done, id } = word;
  const [showDetail, setShowDetail] = useState(false);
  const { vocaState } = useOutletContext();
  const { updateStatus } = vocaState;

  const handleToggle = () => {
    updateStatus(id, !done);
  };

  return (
    <>
      <S.Wrapper>
        <S.Status $status={done} {...clickableProps(handleToggle)}>
          {done ? <S.CompleteIcon /> : <S.InCompleteIcon />}
        </S.Status>
        <S.Content>
          <S.Label>{label}</S.Label>
          <S.Explain>{`${definitions[0].class}.${definitions[0].value}`}</S.Explain>
        </S.Content>
        <S.MoreButton {...clickableProps(() => setShowDetail(true))} />
      </S.Wrapper>
      {showDetail && <Detail word={word} onClose={() => setShowDetail(false)} />}
    </>
  );
};
