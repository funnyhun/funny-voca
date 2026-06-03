import { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { wordQueueManager } from "@/app/services/WordQueueManager";
import { getMasterCache, getProfileCache } from "@/api/common";

/**
 * 전역 단어 데이터의 비동기 점진적 병합(구독)을 제어하고,
 * 컴포넌트별로 완벽히 격리된 깊은 복사 불변 데이터를 단일 공급하며
 * 유튜브 스타일 진행 바 연동 및 온디맨드 우선순위 격상을 지원하는 최종 통합 훅입니다.
 */
export const useMaster = (initialMaster, isCacheValid, vocaList, selectedLabel) => {
  // 훅의 공용 전역 컨텍스트 바인딩 (하위 컴포넌트 호출 시 활용)
  const context = useOutletContext() || {};
  const { vocaState = {}, statsState = {}, master: contextMaster = {} } = context;
  const { voca = {} } = vocaState;
  const { profile = {} } = statsState;

  // 1. [구독용 React 상태] 점진적으로 실시간 비동기 병합되는 단어 마스터 데이터 맵
  const [masterState, setMasterState] = useState(initialMaster || {});
  
  // 2. [진행률 React 상태] 전체 다운로드 진행도 (0~100)
  const [progress, setProgress] = useState(100);

  // 2-1. 백그라운드 큐 매니저로부터 단어 추가 다운로드 성공 이벤트를 실시간 구독
  useEffect(() => {
    if (!initialMaster || Object.keys(initialMaster).length === 0) return;

    const unsubscribe = wordQueueManager.subscribe((newWords) => {
      setMasterState((prev) => ({
        ...prev,
        ...newWords,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [initialMaster]);

  // 2-2. 로컬 풀 캐시가 이미 안전하게 받아진 경우 즉시 React 상태와 일치화
  useEffect(() => {
    if (isCacheValid) {
      const fullCached = getMasterCache();
      if (Object.keys(fullCached).length > 0) {
        setMasterState(fullCached);
        wordQueueManager.reset();
      }
    }
  }, [isCacheValid]);

  // 2-3. 대기열 우선순위 조율 (vocaList 또는 selectedLabel 변경 시)
  useEffect(() => {
    if (!vocaList || Object.keys(vocaList).length === 0) return;
    const activeLabel = selectedLabel || getProfileCache().selected || "";
    wordQueueManager.setVocaList(vocaList, activeLabel);
  }, [JSON.stringify(vocaList), selectedLabel]);

  // 3. 전역 마스터 단어 맵 및 진행도 실시간 계산
  const activeMaster = useMemo(() => {
    return (Object.keys(masterState).length > 0) ? masterState : contextMaster;
  }, [masterState, contextMaster]);

  useEffect(() => {
    const activeVoca = (Object.keys(voca).length > 0) ? voca : vocaList;
    if (activeVoca && Object.keys(activeVoca).length > 0) {
      const currentProgress = wordQueueManager.getProgress(activeVoca);
      setProgress(currentProgress);
    }
  }, [activeMaster, voca, vocaList]);

  /**
   * 특정 청크 ID에 속한 영단어 리스트를 동적 가공 및 결합하여 리턴합니다.
   * - 로컬 캐시를 검사하여 단어가 100% 모두 로드되지 않았다면 자동으로 우선순위를 격상(prioritizeChunk)시키고 isLoaded: false를 반환합니다.
   * - 100% 완비되었을 때에만 깊은 복사본 단어와 isLoaded: true를 반환합니다.
   * @param {string|number} [targetId] 청크 고유 라벨 (생략 시 profile.selected)
   * @returns {Object} { words: Array, isLoaded: boolean }
   */
  const getChunkWords = useCallback((targetId) => {
    const id = targetId || profile.selected;
    if (!id || !voca) return { words: [], isLoaded: false };

    const levelStr = String(id).split("-")[0];
    const levelArray = voca[levelStr] || voca[profile.level] || [];

    let targetVoca = levelArray.find((v) => v.voca_label === id);
    if (!targetVoca && !isNaN(Number(id))) {
      const idx = Number(id);
      targetVoca = levelArray[idx];
    }

    if (!targetVoca) {
      console.warn(`[useMaster] Voca ID ${id}에 해당하는 데이터를 찾을 수 없습니다.`);
      return { words: [], isLoaded: false };
    }

    const doneList = Array.isArray(targetVoca.done) ? targetVoca.done : [];
    const targetWordIds = targetVoca.word || [];

    // 1단계: 청크의 모든 단어 ID가 로컬 캐시에 완료되었는지 정적으로 실시간 판별
    const isAllLoaded = targetWordIds.length > 0 && targetWordIds.every(
      (i) => activeMaster[i] !== undefined || activeMaster[String(i)] !== undefined || activeMaster[Number(i)] !== undefined
    );

    // 2단계: 미완료 청크인 경우 즉각 최우선 1순위로 격상 신호를 던지고 대기(false) 반환
    if (!isAllLoaded) {
      wordQueueManager.prioritizeChunk(id);
      return { words: [], isLoaded: false };
    }

    // 3단계: 100% 완비되었으므로 깊은 복사 가공본 리턴
    const words = targetWordIds.map((i) => {
      const data = activeMaster[i] || activeMaster[String(i)] || activeMaster[Number(i)];
      if (!data) return null;
      const isDone = doneList.includes(i) || doneList.includes(String(i)) || doneList.includes(Number(i));
      return {
        ...data,
        done: isDone
      };
    }).filter(Boolean);

    return {
      words: JSON.parse(JSON.stringify(words)),
      isLoaded: true,
    };
  }, [voca, activeMaster, profile.selected, profile.level]);

  /**
   * 특정 레벨에 속한 청크들의 메타데이터 목록을 가볍게 리턴합니다.
   * @param {number|string} [targetLevel] 레벨 (생략 시 profile.level)
   * @returns {Array} 청크 메타데이터 목록
   */
  const getChunksMeta = useCallback((targetLevel) => {
    const level = targetLevel || profile.level || 700;
    const levelArray = voca[level] || [];
    
    return levelArray.map((chunk) => ({
      voca_label: chunk.voca_label,
      voca_name: chunk.voca_name,
      status: chunk.status,
      wordCount: Array.isArray(chunk.word) ? chunk.word.length : 0,
      doneCount: Array.isArray(chunk.done) ? chunk.done.length : 0,
      completed_at: chunk.completed_at,
    }));
  }, [voca, profile.level]);

  return {
    getMaster: activeMaster,
    getChunk: getChunkWords,
    getChunkMeta: getChunksMeta,
    progress,
    voca,
    profile,
  };
};
