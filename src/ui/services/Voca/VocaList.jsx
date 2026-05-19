import * as S from "./VocaList.styles";
import { useContext } from "react";
import { VocaContext } from "@/ui/app/App";

import { VocaItem } from "./VocaItem";

export const VocaList = () => {
  const { wordMap } = useContext(VocaContext);

  return (
    <S.Wrapper>
      {wordMap.filter(Boolean).map((item, i) => {
        return <VocaItem item={item} key={i} />;
      })}
    </S.Wrapper>
  );
};

