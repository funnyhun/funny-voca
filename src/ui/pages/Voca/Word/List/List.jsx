import * as S from "./List.styles";
import { useState, useMemo, useCallback } from "react";

import { useSelected, useWord } from "@/ui/hooks";
import { Skeleton } from "@/ui/components";

import { Item } from "../Item";
import { Search } from "../Search";
import { Filter } from "../Filter";
import { NoResult } from "../NoResult";
import { Empty } from "../Empty";

import { FILTER_SET, FILTER_TYPE } from "../utils/filter";

export const List = () => {
  const { selected } = useSelected();
  const { words = [], loading } = useWord(selected);

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
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "1.25rem", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <Skeleton height="20px" width="120px" />
          <Skeleton height="16px" width="200px" />
        </div>
      ));
    }

    if (words.length === 0) return <Empty />;

    if (filteredWords.length === 0) return <NoResult />;

    return filteredWords.map((word) => {
      return <Item word={word} key={word.id} />;
    });
  }, [loading, words, filteredWords]);

  return (
    <S.Wrapper>
      <Search keyword={keyword} setKeyword={setKeyword} />
      <Filter currentFilter={filterType} setFilterType={setFilterType} />
      <S.Content>{renderContentUI()}</S.Content>
    </S.Wrapper>
  );
};
