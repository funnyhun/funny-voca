import * as S from "./List.styles";
import { useContext } from "react";
import { VocaContext } from "@/ui/app/App";
import { Item } from "../Item";

export const List = () => {
  const { wordMap } = useContext(VocaContext);

  return (
    <S.Wrapper>
      {wordMap.filter(Boolean).map((item, i) => {
        return <Item item={item} key={i} />;
      })}
    </S.Wrapper>
  );
};
