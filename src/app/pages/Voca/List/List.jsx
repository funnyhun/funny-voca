import * as S from "./List.styles";
import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Item } from "../Item";

export const List = () => {
  const { vocaState, statsState } = useOutletContext();
  const { voca } = vocaState;
  const { profile } = statsState;

  const sortedWordMap = useMemo(() => {
    const list = voca.filter(Boolean);
    if (!profile) return list;

    return [...list].sort((a, b) => {
      const aIsStudying = a.id === profile.selected;
      const bIsStudying = b.id === profile.selected;
      if (aIsStudying && !bIsStudying) return -1;
      if (!aIsStudying && bIsStudying) return 1;
      return a.id - b.id;
    });
  }, [voca, profile]);

  return (
    <S.Wrapper>
      {sortedWordMap.map((item) => {
        const isStudying = profile && item.id === profile.selected;
        return <Item item={item} key={item.id} isStudying={isStudying} />;
      })}
    </S.Wrapper>
  );
};
