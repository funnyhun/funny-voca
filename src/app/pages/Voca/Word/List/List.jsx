import * as S from "./List.styles";
import { useState, useMemo, useCallback } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { useWord } from "@app/hooks";
import { Skeleton } from "@app/components";

import { Item } from "../Item";
import { Search } from "../Search";
import { Filter } from "../Filter";
import { NoResult } from "../NoResult";
import { Empty } from "../Empty";

import { FILTER_SET, FILTER_TYPE } from "../utils/filter";

export const List = () => {
  const { vocaId } = useParams();
  const { words = [], loading } = useWord(vocaId);
  const navigate = useNavigate();

  const { statsState } = useOutletContext();
  const { profile, updateSelectedDay } = statsState;

  const [filterType, setFilterType] = useState(FILTER_TYPE[0]);
  const [keyword, setKeyword] = useState("");

  const isTodayStudyDay = profile && profile.selected === vocaId;

  const handleSetStudyDay = () => {
    updateSelectedDay(vocaId);
  };

  const handleGoToLearn = () => {
    navigate(`/play`);
  };

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
      {profile && (
        <S.BannerContainer>
          <S.BannerContent>
            <S.BannerTitle>
              {(() => {
                const match = vocaId?.match(/_d(\d+)_/);
                return match ? `Day ${match[1]}` : "학습";
              })()}
              {isTodayStudyDay && <S.ActiveBadge>학습 중</S.ActiveBadge>}
            </S.BannerTitle>
            <S.BannerDesc>
              {isTodayStudyDay
                ? "오늘의 활성화된 학습 데이터입니다."
                : "오늘 학습할 데이로 지정하고 대시보드에 연동합니다."}
            </S.BannerDesc>
          </S.BannerContent>
          <S.BannerButton
            $active={isTodayStudyDay}
            onClick={isTodayStudyDay ? handleGoToLearn : handleSetStudyDay}
          >
            {isTodayStudyDay ? "학습하러 가기" : "학습일로 지정"}
          </S.BannerButton>
        </S.BannerContainer>
      )}
      <Search keyword={keyword} setKeyword={setKeyword} />
      <Filter currentFilter={filterType} setFilterType={setFilterType} />
      <S.Content>{renderContentUI()}</S.Content>
    </S.Wrapper>
  );
};
