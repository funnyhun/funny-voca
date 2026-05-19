import * as S from "./List.styles";
import { useState, useMemo, useCallback } from "react";

import { useSelected } from "@/ui/common/hooks/useMyParam";
import { useWord } from "@/ui/common/hooks/useWord";

import { Item } from "../Item";
import { Search } from "../Search";
import { Filter } from "../Filter";
import { NoResult } from "../NoResult";
import { Empty } from "../Empty";

import { FILTER_SET, FILTER_TYPE } from "../utils/filter";

export const List = () => {
  const { selected } = useSelected();
  const { words = [] } = useWord(selected);

  const [filterType, setFilterType] = useState(FILTER_TYPE[0]);
  const [keyword, setKeyword] = useState("");

  const clearCondition = () => {
    setFilterType(FILTER_SET[0]);
    setKeyword("");
  };

  const filteredWords = useMemo(() => {
    let result = FILTER_SET[filterType].callback(words);
    if (keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(lowerKeyword) ||
          word.definitions.some((def) =>
            def.value.toLowerCase().includes(lowerKeyword)
          )
      );
    }
    return result;
  }, [words, filterType, keyword]);

  const renderContentUI = useCallback(() => {
    if (words.length === 0) return <Empty />;

    if (filteredWords.length === 0) return <NoResult />;

    return filteredWords.map((word) => {
      return <Item word={word} key={word.id} />;
    });
  }, [words, filteredWords]);

  return (
    <S.Wrapper>
      <Search keyword={keyword} setKeyword={setKeyword} />
      <Filter currentFilter={filterType} setFilterType={setFilterType} />
      <S.Content>{renderContentUI()}</S.Content>
    </S.Wrapper>
  );
};
