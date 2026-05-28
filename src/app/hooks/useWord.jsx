import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

/**
 * 특정 Day의 단어 리스트와 개별 학습 상태(done)를 결합하여 반환합니다.
 * [Used In] src/pages/Play/Play.jsx, src/pages/Voca/Word/WordList.jsx
 * @param {number} [selected] 조회할 Day 인덱스 (0-based)
 * @returns {Object} { words: Array }
 */
export const useWord = (selected) => {
  const { vocaState, statsState, master } = useOutletContext();
  const { voca, wordStatusMap = {} } = vocaState;
  const { profile } = statsState;

  const targetId = selected || profile.selected;

  const words = useMemo(() => {
    if (!voca) return [];

    let targetVoca = voca.find((v) => v.id === targetId);
    if (!targetVoca && !isNaN(Number(targetId))) {
      const idx = Number(targetId);
      targetVoca = voca[idx];
    }

    if (!targetVoca) {
      console.warn(`Voca ID/Index ${targetId}에 해당하는 데이터를 찾을 수 없습니다.`);
      return [];
    }

    return targetVoca.word.map((i) => {
      // 숫자, 문자열, 혹은 공백이 섞인 경우를 모두 대비한 룩업
      const data = master[i] || master[String(i)] || master[Number(i)];
      
      if (!data) {
        console.error(`[Hook/useWord] Word Data Missing: ID ${i}`);
        return null;
      }
      
      // 유저의 학습 상태(done) 반영
      return {
        ...data,
        done: wordStatusMap[i] || wordStatusMap[String(i)] || wordStatusMap[Number(i)] || false
      };
    }).filter(Boolean);

  }, [voca, targetId, master, wordStatusMap]);


  const loading = useMemo(() => {
    return !voca || voca.length === 0 || !master || Object.keys(master).length === 0;
  }, [voca, master]);

  return { words, loading };
};

