import { supabase, getMasterCache, setMasterCache } from "@/api/common";

/**
 * 1. 특정 청크의 단어 ID 배열을 전달받아, 해당 단어 및 Definition 데이터를 단 1회의 Supabase 쿼리로 일괄 조회합니다.
 * @param {Array<number|string>} wordIds - 조회할 단어 ID 배열
 * @returns {Promise<Object>} 단어 ID를 키로 하는 영단어 마스터 정보 객체 Map
 */
export const getMaster = async (wordIds = []) => {
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
    console.error("[API/Master] getMaster Error:", err);
    return {};
  }
};

/**
 * 2. 서비스 내 모든 레벨(700, 800, 900)의 기준 정보가 되는 Chunk 전체 데이터를 조회합니다.
 * @returns {Promise<Array>} Chunk 테이블 레코드 전체 목록
 */
export const getChunk = async () => {
  try {
    const { data, error } = await supabase
      .from("Chunk")
      .select("*");

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[API/Master] getChunk Error:", err);
    return [];
  }
};

/**
 * 3. 현재 활성화된 스케줄 청크의 단어 데이터가 캐시에 누락되어 있을 시 Supabase에서 선제 보완 쿼리 후 마스터 캐시에 병합하여 최신 마스터 맵을 반환합니다.
 * @param {Object} vocaData - 레벨별 Voca 리스트 객체
 * @param {Object} profile - 사용자 프로필 객체
 * @returns {Promise<Object>} 단어 ID를 키로 하는 마스터 정보 객체 Map
 */
export const getMasterData = async (vocaData, profile) => {
  const currentLevel = profile?.level || 700;
  const levelVoca = vocaData[currentLevel] || [];
  const selectedLabel = profile?.selected || levelVoca[0]?.voca_label || "";

  const currentChunk = levelVoca.find((v) => v.voca_label === selectedLabel) || levelVoca[0];
  let cumulativeMaster = getMasterCache() || {};

  if (currentChunk && currentChunk.word && currentChunk.word.length > 0) {
    const isTargetLoaded = currentChunk.word.every(
      (id) => cumulativeMaster[id] !== undefined || cumulativeMaster[String(id)] !== undefined
    );
    
    if (!isTargetLoaded) {
      console.log(`[API/Master] 캐시 누락 감지. 선제 보완 쿼리 수행 -> ${currentChunk.voca_label}`);
      const fallbackWords = await getMaster(currentChunk.word);
      Object.assign(cumulativeMaster, fallbackWords);
      setMasterCache(cumulativeMaster);
    }
  }

  return cumulativeMaster;
};
