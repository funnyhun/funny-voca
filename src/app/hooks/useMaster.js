import { useState, useEffect, useRef } from "react";
import { wordQueueManager } from "@/app/services/WordQueueManager";
import { getStorage, KEYS } from "@/utils/storage";

/**
 * 전역 Singleton WordQueueManager와 연동하여 영단어 데이터를 점진적으로 렌더링 상태에 병합하고,
 * 리스케줄링이나 선택 청크 변경 시 큐의 우선순위를 즉시 Re-sort/Re-queue하는 고수준 브릿지 훅입니다.
 * 
 * @param {Object} initialMaster - 로더에서 로드된 초기 선제 단어 데이터 맵
 * @param {boolean} isCacheValid - 캐시 유효 여부
 * @param {Object} vocaList - 현재 활성화된 Voca 데이터 셋 { 700: [], 800: [], 900: [] }
 * @param {string} selectedLabel - 현재 암기 완료해야 할 타겟 청크 식별 라벨 (예: '700-marketing_1')
 * @returns {Object} 최종 병합되었거나 계속 다운로드하여 불려지고 있는 마스터 단어 맵
 */
export const useMaster = (initialMaster = {}, isCacheValid = false, vocaList = {}, selectedLabel = "") => {
  const [master, setMaster] = useState(initialMaster);

  // 1단계: 마운트 및 Singleton 다운로더 구독 처리
  useEffect(() => {
    // 큐 매니저의 단어 추가 다운로드 성공 이벤트를 실시간 구독하여 React 렌더링 상태에 점진적 바인딩
    const unsubscribe = wordQueueManager.subscribe((newWords) => {
      setMaster((prev) => ({
        ...prev,
        ...newWords,
      }));
    });

    // 언마운트 시 안전한 구독 해제
    return () => {
      unsubscribe();
    };
  }, []);

  // 2단계: 로컬 캐시가 이미 온전히 다 받아진 경우 즉시 React 상태와 일치화
  useEffect(() => {
    if (isCacheValid) {
      const fullCached = getStorage(KEYS.MASTER) || {};
      if (Object.keys(fullCached).length > 0) {
        setMaster(fullCached);
        // 캐시가 유효하다면 백그라운드 큐 매니저를 강제 리셋하여 워커 중지
        wordQueueManager.reset();
        return;
      }
    }
  }, [isCacheValid]);

  // 3단계: vocaList 또는 selectedLabel 변경 시 동적 대기열 갱신 및 Re-sort 트리거
  useEffect(() => {
    if (!vocaList || Object.keys(vocaList).length === 0) return;

    // 현재 프로필에서 selected 값을 식별 (파라미터 누락 대응용 백업)
    const activeLabel = selectedLabel || getStorage(KEYS.PROFILE)?.selected || "";
    
    // 우선순위 큐 매니저에게 실시간 대기열 재정렬 요청
    wordQueueManager.setVocaList(vocaList, activeLabel);

  }, [JSON.stringify(vocaList), selectedLabel]);

  return master;
};
