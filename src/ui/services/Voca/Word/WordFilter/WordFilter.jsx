import * as S from "./WordFilter.styles";

import { FILTER_SET, FILTER_TYPE } from "@/ui/services/Voca/Word/utils/filter";

function WordFilter({ currentFilter, setFilterType }) {
  return (
    <S.Wrapper>
      {FILTER_TYPE.map((key) => (
        <S.FilterItem key={key} onClick={() => setFilterType(key)} $selected={key === currentFilter}>
          {FILTER_SET[key].label}
        </S.FilterItem>
      ))}
    </S.Wrapper>
  );
}

export { WordFilter };
