import * as S from "./WordList.styles";
import { useState, useMemo, useCallback } from "react";

import { useSelected } from "@/ui/common/hooks/useMyParam";
import { useWord } from "@/ui/common/hooks/useWord";

import { WordItem } from "@/ui/services/Voca/Word/WordItem";
import { WordSearch } from "@/ui/services/Voca/Word/WordSearch";
import { WordFilter } from "@/ui/services/Voca/Word/WordFilter";
import { WordNoResult } from "@/ui/services/Voca/Word/WordNoResult";
import { WordEmpty } from "@/ui/services/Voca/Word/WordEmpty";

import { FILTER_SET, FILTER_TYPE } from "@/ui/services/Voca/Word/utils/filter";

export const WordList = () => {
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
    if (words.length === 0) return <WordEmpty />;

    if (filteredWords.length === 0) return <WordNoResult />;

    return filteredWords.map((word) => {
      return <WordItem word={word} key={word.id} />;
    });
  }, [words, filteredWords]);

  return (
    <S.Wrapper>
      <WordSearch keyword={keyword} setKeyword={setKeyword} />
      <WordFilter currentFilter={filterType} setFilterType={setFilterType} />
      <S.Content>{renderContentUI()}</S.Content>
    </S.Wrapper>
  );
};
