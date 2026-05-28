import * as S from "./List.styles";
import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Item } from "../Item";

/**
 * Voca List
 * - 현재 선택 레벨의 단어장 목록을 정밀 정렬하여 출력합니다.
 * - DB 스키마 일치화를 위해 id 대신 voca_label을 식별 키로 사용합니다.
 */
export const List = () => {
  const { vocaState, statsState } = useOutletContext();
  const { voca } = vocaState;
  const { profile } = statsState;

  const sortedWordMap = useMemo(() => {
    // 1. 현재 레벨의 Voca 목록 추출 (grouped 객체 구조 완벽 대응)
    const currentLevel = profile?.level || 700;
    const currentLevelVoca = Array.isArray(voca) ? voca : (voca?.[currentLevel] || []);
    const list = currentLevelVoca.filter(Boolean);
    if (!profile) return list;

    // 2. 학습 중인 청크를 최상단에 배치하고 나머지는 schedule 오름차순으로 정밀 정렬
    return [...list].sort((a, b) => {
      const aIsStudying = a.voca_label === profile.selected;
      const bIsStudying = b.voca_label === profile.selected;
      if (aIsStudying && !bIsStudying) return -1;
      if (!aIsStudying && bIsStudying) return 1;
      return a.schedule - b.schedule;
    });
  }, [voca, profile]);

  return (
    <S.Wrapper>
      {sortedWordMap.map((item) => {
        const isStudying = profile && item.voca_label === profile.selected;
        return <Item item={item} key={item.voca_label} isStudying={isStudying} />;
      })}
    </S.Wrapper>
  );
};
