import { useEffect } from "react";
import { Button } from "@/app/components";
import { useOverlay } from "@/app/context/OverlayContext";
import * as S from "./SelectionModal.styles";

/**
 * SelectionModal
 * - 선행 학습 완료(시나리오 C) 감지 시 노출되는 프리미엄 계획 수정 제안 모달 컴포넌트입니다.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 오픈 여부
 * @param {string} props.categoryKr - 완료한 카테고리 한글명 (예: "마케팅(1)")
 * @param {Function} props.onKeep - '기존 계획 유지' 클릭 핸들러
 * @param {Function} props.onAdapt - '학습 계획 수정' 클릭 핸들러
 */
export const SelectionModal = ({ isOpen, categoryKr, onKeep, onAdapt }) => {
  const { setOverlay } = useOverlay();

  // 모달이 열리면 뒷배경 오버레이 활성화, 닫히면 비활성화
  useEffect(() => {
    setOverlay(isOpen);
    return () => setOverlay(false);
  }, [isOpen, setOverlay]);

  if (!isOpen) return null;

  return (
    <S.ModalWrapper>
      <S.ModalCard>
        <S.HeaderSection>
          <S.AlertBadge>선행 학습 감지</S.AlertBadge>
          <S.ModalTitle>학습 계획을 변경할까요?</S.ModalTitle>
        </S.HeaderSection>

        <S.BodySection>
          <S.HighlightText>{categoryKr}</S.HighlightText> 학습을 미리 완료하셨습니다.
          <br />
          이 카테고리를 현재 학습 권장 순서로 앞당겨 반영하고 계획을 수정하시겠습니까?
        </S.BodySection>

        <S.FooterSection>
          <Button
            label="학습 계획 수정"
            color="bg_main"
            bg="brand"
            onClick={onAdapt}
            style={{ width: "100%", padding: "14px", fontWeight: "bold" }}
          />
          <Button
            label="기존 계획 유지"
            color="text_main"
            bg="bg_main"
            onClick={onKeep}
            style={{ width: "100%", padding: "14px" }}
          />
        </S.FooterSection>
      </S.ModalCard>
    </S.ModalWrapper>
  );
};
