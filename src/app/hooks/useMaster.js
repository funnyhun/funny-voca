import { useState, useEffect, useRef } from "react";
import { getMaster } from "@/api/word";
import { getStorage, setStorage, KEYS } from "@/utils/storage";

/**
 * 백그라운드 단어 스트리밍 데이터 수집 및 상태 병합을 처리하는 커스텀 훅입니다.
 * 
 * @param {Object} firstBulkData - 진입 오케스트레이터가 로드한 초기 120개 단어 맵
 * @param {boolean} isCacheValid - 캐시 데이터의 정합성 유효 여부
 * @returns {Object} 최종 병합 완료되었거나 수집 중인 전체 단어 맵
 */
export const useMaster = (initialMaster, isCacheValid) => {
  const [master, setMaster] = useState(initialMaster);
  // initialMaster를 1회성 스냅샷으로 캡처하여 참조 변경으로 인한 이펙트 무한 리셋 차단
  const firstBulkRef = useRef(initialMaster);

  useEffect(() => {
    // 이미 모든 데이터가 로컬 스토리지에 온전하게 채워져 있다면 백그라운드 쿼리를 스킵하고 캐시 전체를 리액트 상태에 동기화
    if (isCacheValid) {
      const fullCached = getStorage(KEYS.MASTER) || {};
      setMaster(fullCached);
      return;
    }

    let isMounted = true;
    const BULK_SIZE = 120;

    const loadRemainingWords = async () => {
      let currentOffset = BULK_SIZE;
      // 로컬 스토리지의 현재 조각을 복사하거나 빈 객체 초기화
      let cumulativeWords = { ...getStorage(KEYS.MASTER) };

      // 최초 로드된 120개 데이터도 누적 맵에 포함
      Object.assign(cumulativeWords, firstBulkRef.current);

      while (isMounted) {
        try {
          const nextChunk = await getMaster(BULK_SIZE, currentOffset, true);
          const nextKeys = Object.keys(nextChunk);

          if (nextKeys.length === 0) {
            // 더 이상 조회할 단어가 없는 최종 완료 시점에 전체 마스터 캐시 파일 저장
            setStorage(KEYS.MASTER, cumulativeWords);
            break;
          }
          if (!isMounted) break;

          // 청크 병합
          cumulativeWords = {
            ...cumulativeWords,
            ...nextChunk
          };
          
          // 중간 네트워크 이탈 등 오작동에 대비해 매 청크 로딩 시마다 로컬에 점진적 커밋
          setStorage(KEYS.MASTER, cumulativeWords);

          // UI 렌더링에 동적으로 신규 추가 단어 병합 바인딩
          setMaster(prev => ({
            ...prev,
            ...nextChunk
          }));

          currentOffset += BULK_SIZE;
        } catch (error) {
          console.error("[useMaster] Error loading remaining words:", error);
          break;
        }
      }
    };

    loadRemainingWords();

    return () => {
      isMounted = false;
    };
  }, [isCacheValid]);

  return master;
};
