import * as S from "./List.styles";
import { useState, useMemo, useCallback } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { useWord } from "@app/hooks";
import { Skeleton } from "@app/components";

import { Item } from "../Item/Item";
import { Search } from "../Search/Search";
import { Filter } from "../Filter/Filter";
import { NoResult } from "../NoResult/NoResult";
import { Empty } from "../Empty/Empty";

import { FILTER_SET, FILTER_TYPE } from "../utils/filter";

/**
 * Word List
 * - 특정 단어장에 속한 단어들의 목록을 검색/필터하여 노출하는 페이지 컴포넌트입니다.
 * - updateSelectedLabel API 연동 오류를 해결하고 타이틀 렌더링 정합성을 완전히 보강했습니다.
 */
export const List = () => {
  const { vocaId } = useParams();
  const { words = [], loading } = useWord(vocaId);
  const navigate = useNavigate();

  const { statsState, vocaState } = useOutletContext();
  const { profile, updateSelectedLabel } = statsState;
  const { voca } = vocaState;

  const [filterType, setFilterType] = useState(FILTER_TYPE[0]);
  const [keyword, setKeyword] = useState("");

  const isTodayStudyDay = profile && profile.selected === vocaId;

  // 정규화된 현재 레벨 Voca 배열을 통해 대치되는 한글 카테고리명 및 Day(schedule) 추출
  const currentLevel = profile?.level || 700;
  const currentLevelVoca = Array.isArray(voca) ? voca : (voca?.[currentLevel] || []);
  const targetVoca = currentLevelVoca.find((v) => v.voca_label === vocaId);

  const displayTitle = targetVoca
    ? `Day ${targetVoca.schedule} (${targetVoca.category_kr})`
    : "학습 단어장";

  // 학습일로 지정 클릭 시 updateSelectedLabel API 백그라운드 호출
  const handleSetStudyDay = () => {
    updateSelectedLabel(vocaId);
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
              {displayTitle}
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
