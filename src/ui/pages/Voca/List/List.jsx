import * as S from "./List.styles";
import { useContext, useMemo } from "react";
import { VocaContext, StatsContext } from "@/ui/app/App";
import { Item } from "../Item";

export const List = () => {
  const { wordMap } = useContext(VocaContext);
  const { userData } = useContext(StatsContext);

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
