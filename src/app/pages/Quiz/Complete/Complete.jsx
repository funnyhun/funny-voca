import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button, SelectionModal } from "@app/components";
import { reschedule, getVocaList } from "@/api/voca";
import { getBaseCategoryFromLabel } from "@/api/voca/voca.local";
import * as S from "./Complete.styles";

/**
 * 오늘 날짜를 YYYY-MM-DD 포맷의 문자열로 추출합니다.
 */
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Quiz Complete
 * - 모든 퀴즈 완료 시 노출되는 결과 대시보드 화면입니다.
 * - 이중 API 호출을 완전히 제거하고, 100% 무결점 완수 여부와 최초/추가 완료 여부에 맞춘 분기 연출을 수행합니다.
 */
export const Complete = () => {
  const navigate = useNavigate();
  const { statsState, vocaState } = useOutletContext();
  const { profile, checkLearningScenario, updateSelectedLabel } = statsState;
  const { voca } = vocaState;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedLabel, setCompletedLabel] = useState("");
  const [categoryKr, setCategoryKr] = useState("");

  // 학습 성취도 및 Streak 통계 정보
  const [achievement, setAchievement] = useState({
    isPerfect: false,
    isAdditional: false,
    doneWordsCount: 0,
    totalWordsCount: 0,
    continuedStreak: profile.continued || 0
  });

  useEffect(() => {
    const evaluateAchievement = () => {
      const currentLevel = profile.level || 700;
      const currentLevelVoca = Array.isArray(voca) ? voca : (voca?.[currentLevel] || []);
      if (currentLevelVoca.length === 0) return;

      const todayStr = getTodayString();

      // 1. 오늘 완료 처리된 청크 탐색
      let targetVoca = currentLevelVoca.find((v) => v.completed_at === todayStr && v.status === true);
      
      // 2. 만약 오늘 완료된 청크가 없다면 현재 selected를 타겟으로 삼음 (미완성 완수)
      if (!targetVoca) {
        const activeLabel = profile.selected || currentLevelVoca[0]?.voca_label;
        targetVoca = currentLevelVoca.find((v) => v.voca_label === activeLabel);
      }

      if (!targetVoca) return;

      const label = targetVoca.voca_label;
      setCompletedLabel(label);
      setCategoryKr(targetVoca.category_kr || label.split("-")[1]);

      const doneWords = targetVoca.done?.length || 0;
      const totalWords = targetVoca.word?.length || 0;
      const isPerfectVal = targetVoca.status === true && doneWords === totalWords;

      // 3. 오늘 완료 처리된 총 청크 개수를 조회하여 추가 완료 여부 판별
      const todayCompletedChunks = currentLevelVoca.filter(
        (v) => v.completed_at === todayStr && v.status === true
      );
      const isAdditionalVal = todayCompletedChunks.length > 1;

      setAchievement({
        isPerfect: isPerfectVal,
        isAdditional: isAdditionalVal,
        doneWordsCount: doneWords,
        totalWordsCount: totalWords,
        continuedStreak: profile.continued || 0
      });

      // 4. 선행 학습 완수(시나리오 C)인 경우에만 계획 변경 모달 실행
      if (isPerfectVal) {
        const scenario = checkLearningScenario(label, voca);
        if (scenario === "SCENARIO_C") {
          setIsModalOpen(true);
        }
      }
    };

    evaluateAchievement();
  }, [profile, voca, checkLearningScenario]);

  // '기존 계획 유지' 처리
  const handleKeep = () => {
    setIsModalOpen(false);
  };

  // '학습 계획 수정' 처리 (스왑 및 자동 전진)
  const handleAdapt = async () => {
    setIsModalOpen(false);
    
    const currentLevel = profile.level || 700;
    const catA = getBaseCategoryFromLabel(profile.selected);
    const catB = getBaseCategoryFromLabel(completedLabel);

    if (!catA || !catB || catA === catB) return;

    // 카테고리 스왑 실행
    const swapSuccess = await reschedule(currentLevel, { catA, catB }, false);
    if (swapSuccess) {
      const updatedVocaList = await getVocaList();
      const nextLevelVoca = updatedVocaList[currentLevel] || [];
      const sortedVoca = [...nextLevelVoca].sort((a, b) => a.schedule - b.schedule);
      const nextTodoChunk = sortedVoca.find((v) => v.status === false);
      if (nextTodoChunk) {
        updateSelectedLabel(nextTodoChunk.voca_label);
      }
    }
  };

  const navigateHome = () => navigate("/home");
  const navigateVoca = () => navigate(`/voca/${completedLabel || profile.selected}`);

  // 성취 카드 렌더링 분기
  const renderCardContent = () => {
    const { isPerfect, isAdditional, doneWordsCount, totalWordsCount, continuedStreak } = achievement;

    if (isPerfect) {
      if (isAdditional) {
        return (
          <S.CardContainer $type="additional">
            <S.StreakTitle>오늘 추가 학습 완수!</S.StreakTitle>
            <S.StreakDesc>
              {"오늘 벌써 두 번째 청크를 완벽하게 격파하셨습니다.\n지치지 않는 학습 열정이 정말 대단하십니다."}
            </S.StreakDesc>
            <S.StreakBadge $type="additional">
              현재 {continuedStreak}일 연속 학습 중
            </S.StreakBadge>
            <S.MistakeScore>
              완료 단어: {doneWordsCount} / {totalWordsCount} (오답률 0%)
            </S.MistakeScore>
          </S.CardContainer>
        );
      } else {
        return (
          <S.CardContainer $type="perfect">
            <S.StreakTitle>오늘의 학습 완료!</S.StreakTitle>
            <S.StreakDesc>
              {"축하합니다! 오늘 목표한 청크의 모든 단어를\n단 한 번의 오답도 없이 완벽하게 달성하셨습니다."}
            </S.StreakDesc>
            <S.StreakBadge $type="perfect">
              {continuedStreak}일 연속 달성 중!
            </S.StreakBadge>
            <S.MistakeScore>
              완벽 마스터: {doneWordsCount} / {totalWordsCount}
            </S.MistakeScore>
          </S.CardContainer>
        );
      }
    } else {
      return (
        <S.CardContainer $type="normal">
          <S.StreakTitle>퀴즈 완료!</S.StreakTitle>
          <S.StreakDesc>
            {"아쉽게도 오답이 발생하여 완벽 마스터 달성에는 도달하지 못했습니다.\n틀린 단어들을 단어장에서 확인하고 재도전해 보세요."}
          </S.StreakDesc>
          <S.MistakeScore $isWrong={true}>
            오답 없이 맞춘 단어: {doneWordsCount}개 / 전체 단어: {totalWordsCount}개
          </S.MistakeScore>
          <S.WarningText>
            모든 단어를 한 번에 맞추어야 Streak 증가와 다음 청크 전진이 실행됩니다.
          </S.WarningText>
        </S.CardContainer>
      );
    }
  };

  return (
    <S.Wrapper>
      <S.Image />
      <S.Title>퀴즈 결과</S.Title>
      
      {renderCardContent()}

      <S.Pannel>
        <Button label="단어장 확인하기" color="bg_main" bg="brand" onClick={navigateVoca} />
        <Button label="홈으로 돌아가기" color="text_main" bg="bg_main" onClick={navigateHome} />
      </S.Pannel>

      <SelectionModal
        isOpen={isModalOpen}
        categoryKr={categoryKr}
        onKeep={handleKeep}
        onAdapt={handleAdapt}
      />
    </S.Wrapper>
  );
};
