import { useState, useEffect } from 'react';
import { updateWordStatus, reschedule, deleteVoca } from '@/api/voca';
import { getMaster } from '@/api/word';

/**
 * 학습 단어 데이터(Voca) 관리 및 사용자의 학습 라이프사이클 시나리오를 전담하는 커스텀 훅
 * - 앱의 핵심 비즈니스 시나리오(낙관적 완료 토글, 초기 배정, 공장 초기화)를 엮어 고수준 인터페이스로 제공합니다.
 * - 데이터 영속성(LocalStorage 키, Supabase SQL 쿼리 등) 세부 사양은 완전히 격리되어 모릅니다.
 * 
 * @param {Object} initialVoca - 로더에서 로드된 초기 레벨별 Voca 데이터
 * @param {Object} initialStatusMap - 로더에서 로드된 초기 단어별 완료 상태 맵
 */
export const useVoca = (initialVoca = {}, initialStatusMap = {}) => {
  const [voca, setVoca] = useState(initialVoca);
  const [wordStatusMap, setWordStatusMap] = useState(initialStatusMap);

  // 로더 데이터 갱신(페이지 리네비게이션 등)에 따른 동기화
  useEffect(() => {
    setVoca(initialVoca || {});
    setWordStatusMap(initialStatusMap || {});
  }, [JSON.stringify(initialVoca), JSON.stringify(initialStatusMap)]);

  /**
   * [시나리오 1] 단어 학습 완료/미완료 토글 및 낙관적 상태 전이
   * 사용자가 학습 카드를 완료하거나 퀴즈 정답 시, UI를 즉각 갱신한 뒤 백그라운드 영속 동기화를 트리거합니다.
   * 
   * @param {number|string} wordId - 변경 대상 단어 ID
   * @param {boolean} status - 완료 여부 (true/false)
   */
  const updateStatus = (wordId, status) => {
    // 1단계: 즉각적인 UI 반응을 위한 낙관적 리액트 상태 즉시 업데이트
    setWordStatusMap((prev) => ({
      ...prev,
      [wordId]: status
    }));

    setVoca((prevVoca) => {
      if (!prevVoca || Array.isArray(prevVoca)) return prevVoca;

      const nextVoca = { ...prevVoca };
      Object.keys(nextVoca).forEach((level) => {
        if (!Array.isArray(nextVoca[level])) return;

        nextVoca[level] = nextVoca[level].map((chunk) => {
          const isTarget = chunk.word.includes(wordId) || 
                           chunk.word.includes(String(wordId)) || 
                           chunk.word.includes(Number(wordId));

          if (!isTarget) return chunk;

          let nextDone = Array.isArray(chunk.done) ? [...chunk.done] : [];
          const strId = String(wordId);
          const numId = Number(wordId);

          if (status) {
            if (!nextDone.includes(strId) && !nextDone.includes(numId)) {
              nextDone.push(wordId);
            }
          } else {
            nextDone = nextDone.filter((id) => String(id) !== strId && Number(id) !== numId);
          }

          const nextChunkStatus = nextDone.length === chunk.word.length;

          return {
            ...chunk,
            done: nextDone,
            status: nextChunkStatus
          };
        });
      });

      return nextVoca;
    });

    // 2단계: 고수준 비동기 API 백그라운드 위임 (세션에 따라 LS 및 DB 비동기 반영)
    updateWordStatus(wordId, status)
      .then((latestVocaList) => {
        if (latestVocaList) {
          // 동기화 완료 후 반환된 최신 정합 데이터로 정밀 상태 재조정
          setVoca(latestVocaList);
        }
      })
      .catch((err) => {
        console.error("[useVoca] 단어 상태 동기화 실패:", err);
      });
  };

  /**
   * [시나리오 2] 최초 웰컴 가입 완료에 따른 최초 데이터 배정 및 생성
   * 
   * @param {number} level - 생성할 학습 타겟 레벨 (700, 800, 900)
   */
  const initVoca = async (level) => {
    try {
      const parsedLevel = Number(level) || 700;
      const result = await reschedule(parsedLevel, null, false);
      if (result) {
        setVoca(result);
        return result; // 생성된 최신 Voca 스케줄 목록을 명시적으로 반환
      } else {
        throw new Error("스케줄 데이터 생성 실패");
      }
    } catch (err) {
      console.error("[useVoca] initVoca 에러:", err);
      throw new Error("학습 데이터를 초기화하는 중 오류가 발생했습니다.");
    }
  };

  /**
   * [시나리오 3] 학습 데이터 전체 공장 초기화 및 welcome 강제 전이
   * DB와 로컬 스토리지를 완벽하게 파지하고 앱을 극초기화 상태로 welcome 페이지로 돌려보냅니다.
   */
  const resetVoca = async () => {
    try {
      // 1단계: API를 통해 로컬 캐시 및 원격 데이터베이스 학습 정보 완전 파지 실행
      const success = await deleteVoca();
      if (!success) {
        throw new Error("API 레벨 삭제 처리 실패");
      }

      // 2단계: 훅의 리액트 상태 전면 초기화
      setVoca({});
      setWordStatusMap({});

      // 3단계: 공장 초기화 정책에 따른 welcome 강제 리다이렉트
      // 브라우저 캐시가 완전히 날아갔으므로, welcome 프로필 생성 화면으로 브라우저 수준에서 완벽하게 강제 전이시킵니다.
      const rawBasePath = import.meta.env.VITE_BASE_PATH || "/";
      const cleanBasePath = rawBasePath.endsWith("/") && rawBasePath !== "/" ? rawBasePath.slice(0, -1) : rawBasePath;
      const targetUrl = cleanBasePath === "/" ? "/welcome" : `${cleanBasePath}/welcome`;
      window.location.href = targetUrl;

    } catch (err) {
      console.error("[useVoca] resetVoca 공장 초기화 에러:", err);
      throw new Error("학습 데이터를 완벽히 초기화하는 중 오류가 발생했습니다.");
    }
  };

  return {
    voca,
    wordStatusMap,
    updateStatus,
    initVoca,
    resetVoca,
    getMaster,
  };
};
