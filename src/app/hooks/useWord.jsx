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

    const levelStr = String(targetId).split("-")[0];
    const levelArray = voca[levelStr] || voca[profile.level] || [];

    let targetVoca = levelArray.find((v) => v.voca_label === targetId);
    if (!targetVoca && !isNaN(Number(targetId))) {
      const idx = Number(targetId);
      targetVoca = levelArray[idx];
    }

    if (!targetVoca) {
      console.warn(`Voca ID/Index ${targetId}에 해당하는 데이터를 찾을 수 없습니다.`);
      return [];
    }

    const doneList = Array.isArray(targetVoca.done) ? targetVoca.done : [];

    return targetVoca.word.map((i) => {
      // 숫자, 문자열, 혹은 공백이 섞인 경우를 모두 대비한 룩업
      const data = master[i] || master[String(i)] || master[Number(i)];
      
      if (!data) {
        console.error(`[Hook/useWord] Word Data Missing: ID ${i}`);
        return null;
      }
      
      // 해당 단어가 targetVoca.done 배열에 포함되어 있는지 확인하여 완료 여부 반영
      const isDone = doneList.includes(i) || doneList.includes(String(i)) || doneList.includes(Number(i));
      
      return {
        ...data,
        done: isDone
      };
    }).filter(Boolean);

  }, [voca, targetId, master, wordStatusMap]);


  const loading = useMemo(() => {
    return !voca || voca.length === 0 || !master || Object.keys(master).length === 0;
  }, [voca, master]);

  return { words, loading };
};

