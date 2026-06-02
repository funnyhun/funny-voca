import { supabase } from "@/api/common";

/**
 * 1. 특정 청크의 단어 ID 배열을 전달받아, 해당 단어 및 Definition 데이터를 단 1회의 Supabase 쿼리로 일괄 조회합니다.
 * @param {Array<number|string>} wordIds - 조회할 단어 ID 배열
 * @returns {Promise<Object>} 단어 ID를 키로 하는 영단어 마스터 정보 객체 Map
 */
export const getWordsByChunk = async (wordIds = []) => {
  if (!wordIds || wordIds.length === 0) return {};

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
      `)
      .in("word_id", wordIds.map(Number));

    if (error) throw error;
    if (!data) return {};

    const wordMap = {};
    data.forEach((item) => {
      const id = item.id;
      if (id) {
        wordMap[id] = {
          ...item,
          done: false,
        };
      }
    });

    return wordMap;
  } catch (err) {
    console.error("[API/Master] getWordsByChunk Error:", err);
    return {};
  }
};

/**
 * 2. 서비스 내 모든 레벨(700, 800, 900)의 기준 정보가 되는 Chunk 전체 데이터를 조회합니다.
 * @returns {Promise<Array>} Chunk 테이블 레코드 전체 목록
 */
export const getAllChunks = async () => {
  try {
    const { data, error } = await supabase
      .from("Chunk")
      .select("*");

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[API/Master] getAllChunks Error:", err);
    return [];
  }
};

/**
 * 3. 초기 진입 시점에 활성화된 레벨의 스케줄링 기초 정보(Schedule 순서 및 해당 레벨의 Chunk 데이터)를 병렬 로드합니다.
 * @returns {Promise<Object>} { defaultCategoryOrder: Array, targetChunks: Array }
 */
export const getInitialScheduleData = async (targetLevel = 700) => {
  try {
    const [schedResult, chunkResult] = await Promise.all([
      supabase.from("Schedule").select("category_en").order("schedule", { ascending: true }),
      supabase.from("Chunk").select("*").eq("level", Number(targetLevel) || 700)
    ]);

    if (schedResult.error) throw schedResult.error;
    if (chunkResult.error) throw chunkResult.error;

    return {
      defaultCategoryOrder: (schedResult.data || []).map((s) => s.category_en),
      targetChunks: chunkResult.data || [],
    };
  } catch (err) {
    console.error("[API/Master] getInitialScheduleData Error:", err);
    return { defaultCategoryOrder: [], targetChunks: [] };
  }
};
