import * as S from "./List.styles";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import { useMaster } from "@app/hooks";
import { withSkeleton } from "@/app/components/HOC";
import { SkeletonList } from "@/app/components/Skeleton/templates";

import { Item } from "../Item/Item";
import { Search } from "../Search/Search";
import { Filter } from "../Filter/Filter";
import { NoResult } from "../NoResult/NoResult";
import { Empty } from "../Empty/Empty";
import { Banner } from "../../Banner/Banner";

import { FILTER_SET, FILTER_TYPE } from "../utils/filter";

/**
 * Word List
 * - 특정 단어장에 속한 단어들의 목록을 검색/필터하여 노출하는 페이지 컴포넌트입니다.
 * - updateSelectedLabel API 연동 오류를 해결하고 타이틀 렌더링 정합성을 완전히 보강했습니다.
 */
const ListComponent = () => {
  const { vocaId } = useParams();
  const { getChunk } = useMaster();
  const [listWords, setListWords] = useState([]);
  const navigate = useNavigate();

  const { statsState, vocaState } = useOutletContext();
  const { profile, updateSelectedLabel } = statsState;
  const { voca } = vocaState;

  const [filterType, setFilterType] = useState(FILTER_TYPE[0]);
  const [keyword, setKeyword] = useState("");

  const isTodayStudyDay = profile && profile.selected === vocaId;

  const { words, isLoaded } = getChunk(vocaId);

  // 최초 로드 시 혹은 vocaId 변경 시에만 깊은 복사본 단어 목록을 격리 고정
  useEffect(() => {
    if (isLoaded && words.length > 0 && listWords.length === 0) {
      setListWords(words);
    }
  }, [vocaId, isLoaded, words, listWords.length]);

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
    let result = FILTER_SET[filterType].callback(listWords);
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
  }, [listWords, filterType, keyword]);

  const renderContentUI = useCallback(() => {
    if (listWords.length === 0) return <Empty />;

    if (filteredWords.length === 0) return <NoResult />;

    return filteredWords.map((word) => {
      return <Item word={word} key={word.id} />;
    });
  }, [listWords, filteredWords]);

  return (
    <S.Wrapper>
      {profile && (
        <Banner
          displayTitle={displayTitle}
          isTodayStudyDay={isTodayStudyDay}
          handleGoToLearn={handleGoToLearn}
          handleSetStudyDay={handleSetStudyDay}
        />
      )}
      <Search keyword={keyword} setKeyword={setKeyword} />
      <Filter currentFilter={filterType} setFilterType={setFilterType} />
      <S.Content>{renderContentUI()}</S.Content>
    </S.Wrapper>
  );
};

export const List = withSkeleton(ListComponent, SkeletonList);

