import { useMemo, useContext } from "react";
import { VocaContext, StatsContext, AppContext } from "@/ui/app/App";

/**
 * 특정 Day의 단어 리스트와 개별 학습 상태(done)를 결합하여 반환합니다.
 * [Used In] src/pages/Play/Play.jsx, src/pages/Voca/Word/WordList.jsx
 * @param {number} [selected] 조회할 Day 인덱스 (0-based)
 * @returns {Object} { words: Array }
 */
export const useWord = (selected) => {
  const { wordMap, wordStatusMap = {} } = useContext(VocaContext);
  const { userData } = useContext(StatsContext);
  const { wordData } = useContext(AppContext);

  const idx = typeof selected === "number" ? selected : userData.selected;

  const words = useMemo(() => {
    if (!wordMap || !wordMap[idx]) {
      console.warn(`Day index ${idx}에 해당하는 데이터를 찾을 수 없습니다.`);
      return [];
    }

    return wordMap[idx].word.map((i) => {
      // 숫자, 문자열, 혹은 공백이 섞인 경우를 모두 대비한 룩업
      const data = wordData[i] || wordData[String(i)] || wordData[Number(i)];
      
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

  }, [wordMap, idx, wordData, wordStatusMap]);


  const loading = useMemo(() => {
    return !wordMap || wordMap.length === 0 || !wordData || Object.keys(wordData).length === 0;
  }, [wordMap, wordData]);

  return { words, loading };
};

