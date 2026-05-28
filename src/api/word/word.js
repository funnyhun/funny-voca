import { supabase, fetchPages } from "@/api/client";
import { getStorage, setStorage, KEYS } from "@/utils/storage";

/**
 * 서비스에서 사용하는 모든 단어의 마스터 데이터를 조회합니다.
 * @returns {Promise<Object>} 단어 ID(word_id)를 키로 하는 단어 데이터 맵
 * @description 
 * - Word 및 Definition 테이블을 조인하여 가져옵니다.
 * - 결과값은 O(1) 조회를 위해 객체 형태로 변환하여 반환합니다.
 */
export const getMaster = async (limit = null, offset = 0) => {
  try {
    const cachedWords = getStorage(KEYS.MASTER);

    // 캐시가 존재하고 유효한 경우 로컬 캐시 데이터 슬라이싱 및 즉시 반환
    if (cachedWords && typeof cachedWords === "object" && Object.keys(cachedWords).length > 0) {
      if (limit !== null) {
        const wordMap = {};
        // day 및 알파벳 순 정렬 기준으로 정렬된 id 목록 생성
        const sortedItems = Object.values(cachedWords).sort((a, b) => {
          if (a.day !== b.day) return a.day - b.day;
          return (a.word || "").localeCompare(b.word || "");
        });
        
        const sliced = sortedItems.slice(offset, offset + limit);
        sliced.forEach(item => {
          wordMap[item.id] = item;
        });
        return wordMap;
      }
      return cachedWords;
    }

    // 1. limit이 명시된 경우 특정 범위만 쿼리하여 속도 개선
    if (limit !== null) {
      const { data, error } = await supabase
        .from("Word")
        .select(`
          id:word_id,
          word,
          day,
          category,
          definitions:Definition (
            class,
            value:definition,
            pronounce,
            example_en,
            example_ko,
            quiz_en,
            quiz_ko
          )
        `)
        .order("day", { ascending: true })
        .order("word", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      if (!data) return {};

      const wordMap = {};
      data.forEach(item => {
        const id = item.id;
        if (id) {
          wordMap[id] = {
            ...item,
            done: false
          };
        }
      });
      return wordMap;
    }

    // 2. limit이 null인 경우 기존 하위 호환성을 유지하여 전체 데이터를 fetchPages로 로드
    const data = await fetchPages(() => 
      supabase
        .from("Word")
        .select(`
          id:word_id,
          word,
          day,
          category,
          definitions:Definition (
            class,
            value:definition,
            pronounce,
            example_en,
            example_ko,
            quiz_en,
            quiz_ko
          )
        `)
        .order("day", { ascending: true })
        .order("word", { ascending: true })
    );

    if (!data) return {};

    const wordMap = {};
    data.forEach(item => {
      const id = item.id;
      if (id) {
        wordMap[id] = {
          ...item,
          done: false
        };
      }
    });

    // 전체 로딩된 결과를 한 번에 로컬에 캐싱
    setStorage(KEYS.MASTER, wordMap);

    return wordMap;
  } catch (err) {
    console.error("[API/Common] Critical Master Data Error:", err);
    return {};
  }
};
