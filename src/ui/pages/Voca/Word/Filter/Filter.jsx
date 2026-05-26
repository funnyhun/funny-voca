import * as S from "./Filter.styles";

import { FILTER_SET, FILTER_TYPE } from "../utils/filter";

export const Filter = ({ currentFilter, setFilterType }) => {
  return (
    <S.Wrapper>
      {FILTER_TYPE.map((key) => (
        <S.FilterItem key={key} onClick={() => setFilterType(key)} $selected={key === currentFilter}>
          {FILTER_SET[key].label}
        </S.FilterItem>
      ))}
    </S.Wrapper>
  );
};
