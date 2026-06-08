import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button, SelectionModal } from "@app/components";
import { updateVoca, reschedule, getVocaList } from "@/api/voca";
import { getBaseCategoryFromLabel } from "@/api/voca/voca.local";
import { Wrapper, Image, Title, Content, Pannel } from "./Complete.styles";

/**
 * Play Complete
 * - 단어 학습 완료 시 노출되는 화면입니다.
 * - 선행 학습 완료(시나리오 C)인 경우, 계획 변경 제안 모달을 띄워 계획 수정을 제어합니다.
 */
export const Complete = ({ replayCard }) => {
  const navigate = useNavigate();
  const { statsState, vocaState } = useOutletContext();
  const { profile, checkLearningScenario, updateSelectedLabel } = statsState;
  const { voca } = vocaState;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedLabel, setCompletedLabel] = useState("");
  const [categoryKr, setCategoryKr] = useState("");

  useEffect(() => {
    const handleComplete = async () => {
      const currentLevel = profile.level || 700;
      const currentLevelVoca = Array.isArray(voca) ? voca : (voca?.[currentLevel] || []);

      const activeLabel = profile.selected || currentLevelVoca[0]?.voca_label;
      if (!activeLabel || currentLevelVoca.length === 0) return;

      const targetVoca = currentLevelVoca.find((v) => v.voca_label === activeLabel);
      if (!targetVoca) return;

      setCompletedLabel(activeLabel);
      setCategoryKr(targetVoca.category_kr || activeLabel.split("-")[1]);

      const doneList = targetVoca.word || [];

      // API를 호출하여 학습 완료(status = true) 및 당일 완료 날짜 동기화
      const success = await updateVoca(activeLabel, doneList, true);
      if (!success) {
        console.error("Voca 성취 업데이트 실패");
        return;
      }

      // 2. 학습 완료 시나리오 판별
      const scenario = checkLearningScenario(activeLabel, voca);

      // 3. 선행 완료(시나리오 C)인 경우 SelectionModal 팝업 노출
      if (scenario === "SCENARIO_C") {
        setIsModalOpen(true);
      }
    };

    handleComplete();
  }, [profile.selected, voca, checkLearningScenario]);

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
      // 최신 Voca 리스트를 다시 조회하여 다음 미완료 청크로 selected 갱신
      const updatedVocaList = await getVocaList();
      const nextLevelVoca = updatedVocaList[currentLevel] || [];
      const sortedVoca = [...nextLevelVoca].sort((a, b) => a.schedule - b.schedule);
      const nextTodoChunk = sortedVoca.find((v) => v.status === false);
      if (nextTodoChunk) {
        updateSelectedLabel(nextTodoChunk.voca_label);
      }
    }
  };

  const navigateQuiz = () => navigate("/quiz");

  return (
    <Wrapper>
      <Image />
      <Title>학습 완료!</Title>
      <Content>{"오늘의 단어를 모두 확인했습니다.\n퀴즈로 이동할까요?"}</Content>
      <Pannel>
        <Button label="퀴즈 풀러가기" color="bg_main" bg="brand" onClick={navigateQuiz} />
        <Button label="다시 학습하기" color="text_main" bg="bg_main" onClick={replayCard} />
      </Pannel>

      <SelectionModal
        isOpen={isModalOpen}
        categoryKr={categoryKr}
        onKeep={handleKeep}
        onAdapt={handleAdapt}
      />
    </Wrapper>
  );
};
