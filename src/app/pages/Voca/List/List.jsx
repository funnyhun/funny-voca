import * as S from "./List.styles";
import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Item } from "../Item";

export const List = () => {
  const { vocaState, statsState } = useOutletContext();
  const { wordMap } = vocaState;
  const { userData } = statsState;

  const sortedWordMap = useMemo(() => {
    const list = wordMap.filter(Boolean);
    if (!userData) return list;

    return [...list].sort((a, b) => {
      const aIsStudying = a.id === userData.selected;
      const bIsStudying = b.id === userData.selected;
      if (aIsStudying && !bIsStudying) return -1;
      if (!aIsStudying && bIsStudying) return 1;
      return a.id - b.id;
    });
  }, [wordMap, userData]);

  return (
    <S.Wrapper>
      {sortedWordMap.map((item) => {
        const isStudying = userData && item.id === userData.selected;
        return <Item item={item} key={item.id} isStudying={isStudying} />;
      })}
    </S.Wrapper>
  );
};
