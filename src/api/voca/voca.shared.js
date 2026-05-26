import { supabase, fetchPages } from "@/api/client";

/**
 * Word 테이블에서 전체 단어를 로드하고 레벨별 누적 wordMap 구조로 빌드합니다.
 * guest와 user 양쪽에서 공통으로 사용하는 핵심 로직입니다.
 * 
 * @param {Object} [statusMap={}] - word_id를 키로 하는 학습 상태 맵 (user의 경우 DB에서 조회한 값)
 * @returns {Promise<Object|null>} { wordMaps } 또는 null
 */
export const buildWordMaps = async (statusMap = {}) => {
  const words = await fetchPages(() =>
    supabase
      .from("Word")
      .select("word_id, level, day, category")
  );

  if (!words) return null;

  const levelGroups = {
    default: words.filter(w => String(w.level) === "0" || String(w.level) === "700"),
    "800": words.filter(w => ["0", "700", "800"].includes(String(w.level))),
    "900": words.filter(w => ["0", "700", "800", "900"].includes(String(w.level))),
  };

  const wordMaps = {};

  Object.keys(levelGroups).forEach(l => {
    const groupWords = levelGroups[l];
    const tempMap = {};

    groupWords.forEach(w => {
      let offset = 0;
      const levelVal = String(w.level);
      if (levelVal === "800") offset = 30;
      else if (levelVal === "900") offset = 60;

      const actualDay = (w.day || 1) + offset;
      const catName = w.category || "기타";
      const key = `${actualDay}_${catName}`;

      if (!tempMap[key]) {
        tempMap[key] = { category: catName, day: actualDay, word: [], length: 0 };
      }
      tempMap[key].word.push(w.word_id);
      tempMap[key].length++;
    });

    const categories = Object.values(tempMap);
    categories.sort((a, b) => (a.day - b.day) || a.category.localeCompare(b.category));

    wordMaps[l] = categories.map((c, idx) => {
      const wordStatus = {};
      let finishedCount = 0;

      c.word.forEach(wId => {
        const status = statusMap[wId] || false;
        wordStatus[wId] = status;
        if (status) finishedCount++;
      });

      const length = c.length || c.word.length || 1;

      return {
        ...c,
        id: idx,
        wordStatus,
        finishedCount,
        progress: Math.floor((finishedCount / length) * 100),
        done: finishedCount === length,
      };
    });
  });

  return wordMaps;
};
