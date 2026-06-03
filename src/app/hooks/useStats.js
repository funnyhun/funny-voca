import { useState, useEffect } from 'react';
import { getProfileCache, setProfileCache } from "@/api/common";
import { updateProfile } from '@/api/profile';

/**
 * 오늘 날짜를 YYYY-MM-DD 문자열 포맷으로 가져옵니다.
 * @returns {string} YYYY-MM-DD 날짜 문자열
 */
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 학습 통계 및 사용자 선택 진도(selected) 메타데이터 관리를 위한 커스텀 훅
 * - YYYY-MM-DD 만료 날짜 대조 및 schedule 대소 비교 시나리오 판별을 지원합니다.
 */
export const useStats = (initialProfile = {}) => {
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
  }, [JSON.stringify(initialProfile)]);

  // 1. YYYY-MM-DD 만료 날짜 기준 오늘의 학습 완료 상태 판별
  const todayStr = getTodayString();
  const isTodayDone = profile?.completed_date === todayStr;

  /**
   * 실시간 권장 학습 청크 동적 탐색 (단일 진실점)
   * Voca 목록을 schedule 오름차순 정렬 후 status = false 인 첫 청크 반환
   * 
   * @param {Array} vocaList 전체 Voca 리스트
   * @returns {Object|null} 오늘의 실시간 동적 권장 학습 청크 객체
   */
  const getRecommendedChunk = (vocaList = []) => {
    const activeLevel = profile?.level || 700;
    const array = Array.isArray(vocaList)
      ? vocaList
      : (vocaList?.[activeLevel] || []);

    if (!array || array.length === 0) return null;
    
    // schedule 오름차순으로 정렬
    const sorted = [...array].sort((a, b) => a.schedule - b.schedule);
    
    // 완료되지 않은(status가 false) 첫 번째 청크 탐색
    return sorted.find((v) => v.status === false) || null;
  };

  /**
   * 사용자가 현재 선택해서 학습 중인 voca_label 앵커 갱신
   */
  const updateSelectedLabel = (newLabel) => {
    const updated = setProfileCache({ selected: newLabel });
    setProfile(updated);

    // DB 영속성 백그라운드 동기화 (오류 발생 시 로그 출력)
    updateProfile({ selected: newLabel }).catch((err) => {
      console.error("[useStats] updateSelectedLabel sync failed:", err);
    });
  };

  /**
   * 청크 완료 시점의 학습 시나리오 A, B, C 판별
   * Voca 테이블 내에 이미 매겨진 schedule 번호 대소비교만으로 오차 없이 100% 직관적으로 판별합니다.
   * 
   * @param {string} completedLabel 완료된 청크의 voca_label (예: '700-marketing_1')
   * @param {Array} vocaList 전체 Voca 목록
   * @returns {string} 'SCENARIO_A' (권장 완수), 'SCENARIO_B' (복습 완료), 'SCENARIO_C' (선행 완료), 'KEEP' (진도 진행 중)
   */
  const checkLearningScenario = (completedLabel, vocaList = []) => {
    if (!completedLabel || !vocaList) return 'KEEP';

    const levelStr = completedLabel.split("-")[0];
    const array = Array.isArray(vocaList)
      ? vocaList
      : (vocaList?.[levelStr] || vocaList?.[profile?.level] || []);

    if (array.length === 0) return 'KEEP';

    // 1. 완료된 청크 및 현재 선택된 청크 로드
    const completedChunk = array.find((v) => v.voca_label === completedLabel);
    
    const currentSelectedLabel = profile.selected || array[0]?.voca_label || "";
    const selectedChunk = array.find((v) => v.voca_label === currentSelectedLabel);

    if (!completedChunk || !selectedChunk) return 'KEEP';

    // 2. 스왑과 정렬이 완벽하게 동기화된 schedule 순번 값을 비교하여 즉시 판별
    // A) 완료한 청크의 schedule이 선택한 청크보다 이전인 경우 -> 시나리오 B (복습 완료)
    if (completedChunk.schedule < selectedChunk.schedule) {
      return 'SCENARIO_B';
    }

    // B) 완료한 청크의 schedule이 선택한 청크와 정확히 일치하는 경우 -> 시나리오 A (권장 완수)
    if (completedChunk.schedule === selectedChunk.schedule) {
      return 'SCENARIO_A';
    }

    // C) 완료한 청크의 schedule이 선택한 청크보다 나중인 경우 -> 시나리오 C (선행 완료)
    if (completedChunk.schedule > selectedChunk.schedule) {
      return 'SCENARIO_C';
    }

    return 'KEEP';
  };

  return {
    profile,
    isTodayDone,
    getRecommendedChunk,
    updateSelectedLabel,
    checkLearningScenario,
  };
};
