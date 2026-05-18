import { supabase } from "./supabase";

/**
 * 서비스에서 사용하는 모든 단어의 마스터 데이터를 조회합니다.
 * @returns {Promise<Object>} 단어 ID(word_id)를 키로 하는 단어 데이터 맵
 * @description 
 * - Word 및 Definition 테이블을 조인하여 가져옵니다.
 * - 결과값은 O(1) 조회를 위해 객체 형태로 변환하여 반환합니다.
 */
export const getMaster = async () => {
  try {
    const { data, error } = await supabase
      .from("Word")
      .select(`
        id:word_id,
        word,
        definitions:Definition (
          class,
          value:definition,
          pronounce,
          example_en,
          example_ko,
          quiz_en,
          quiz_ko
        )
      `);

    if (error) {
      console.error("[API/Common] Get Master Data Error:", error.message);
      return {};
    }

    // 배열을 ID 기반 맵으로 변환
    const wordMap = {};
    data.forEach(item => {
      const id = item.id;
      if (id) {
        wordMap[id] = {
          ...item,
          done: false // 기본 학습 상태는 false
        };
      }
    });

    return wordMap;
  } catch (err) {
    console.error("[API/Common] Critical Master Data Error:", err);
    return {};
  }
};
