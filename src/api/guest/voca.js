import { getStorage, setStorage, KEYS } from "../util/storage";
import { supabase, fetchPages } from "../common/supabase";

/**
 * 게스트 사용자의 단어 학습 데이터를 초기화합니다.
 * @param {string} level - 선택된 레벨
 * @returns {Promise<Object|null>} 생성된 userData 및 wordMap 상태
 */
export const postVoca = async (level) => {
  try {
    // 1. 단어 데이터 로드 (Supabase Word 테이블에서 조회)
    const words = await fetchPages(() => 
      supabase
        .from("Word")
        .select("word_id, level, day, category")
    );
    
    if (!words) {
      console.error("[API/Guest] 단어 목록 로드 실패: 데이터가 비어있습니다.");
      return null;
    }

    const tempMaps = {};

    // 2. Level 및 Category별 그룹화
    words.forEach(w => {
      let levelStr = String(w.level);
      if (levelStr === "0" || levelStr === "700") levelStr = "default";

      if (!tempMaps[levelStr]) tempMaps[levelStr] = {};

      const catName = w.category || "기타";
      if (!tempMaps[levelStr][catName]) {
        tempMaps[levelStr][catName] = {
          category: catName,
          day: w.day || 1,
          word: [],
          length: 0
        };
      }

      tempMaps[levelStr][catName].word.push(w.word_id);
      tempMaps[levelStr][catName].length++;
    });

    // 3. Dense Array로 변환 및 정렬
    const wordMaps = {};
    Object.keys(tempMaps).forEach(l => {
      const categories = Object.values(tempMaps[l]);
      categories.sort((a, b) => (a.day - b.day) || a.category.localeCompare(b.category));

      wordMaps[l] = categories.map((c, idx) => ({
        ...c,
        id: idx,
        done: false,
        finishedCount: 0,
        progress: 0
      }));
    });

    setStorage(KEYS.WORD_MAP, wordMaps);

    // 4. 사용자 기본 데이터 초기화
    const now = new Date();
    const userData = {
      startedTime: now.setHours(0, 0, 0, 0),
      continued: 0,
      today: 0,
      learned: 0,
      selected: 0,
      level: level,
    };
    setStorage(KEYS.USER_DATA, userData);

    return { userData, wordMap: wordMaps[level] || [] };
  } catch (err) {
    console.error("[API/Guest] Critical postVoca Error:", err);
    return null;
  }
};

/**
 * 게스트 사용자의 전체 WORD_MAP 또는 특정 레벨의 단어 맵을 조회합니다.
 * @param {string} [level] - 조회할 레벨 (생략 시 USER_DATA의 레벨 기준)
 * @returns {Array} 단어 학습 맵 리스트
 */
export const getVoca = (level) => {
  const wordMaps = getStorage(KEYS.WORD_MAP);
  if (!wordMaps) return [];

  if (level) {
    return wordMaps[level] || [];
  }

  const userData = getStorage(KEYS.USER_DATA);
  const currentLevel = userData?.level || "default";
  return wordMaps[currentLevel] || [];
};

/**
 * 게스트 사용자의 특정 단어 학습 상태를 업데이트합니다.
 * @param {number} wordId - 단어 ID
 * @param {boolean} status - 학습 완료 여부
 * @returns {boolean} 업데이트 성공 여부
 */
export const updateVoca = (wordId, status = true) => {
  const wordMaps = getStorage(KEYS.WORD_MAP);
  const userData = getStorage(KEYS.USER_DATA);
  
  if (!wordMaps || !userData) return false;

  const currentLevel = userData.level || "default";
  const wordMap = wordMaps[currentLevel] || [];

  let learnedIncrement = 0;

  const updatedWordMap = wordMap.map((day) => {
    if (!day || !day.word.includes(wordId)) return day;

    // 단어별 개별 status 맵
    const wordStatus = { ...(day.wordStatus || {}) };
    const wasAlreadyDone = wordStatus[wordId] === true;
    wordStatus[wordId] = status;

    // finishedCount 계산 (중복 방지)
    let { finishedCount = 0 } = day;
    if (status && !wasAlreadyDone) {
      finishedCount += 1;
      learnedIncrement = 1;
    } else if (!status && wasAlreadyDone) {
      finishedCount = Math.max(0, finishedCount - 1);
      learnedIncrement = -1;
    }

    const length = day.length || day.word.length || 1;
    return {
      ...day,
      wordStatus,
      finishedCount,
      progress: Math.floor((finishedCount / length) * 100),
      done: finishedCount === length,
    };
  });

  wordMaps[currentLevel] = updatedWordMap;
  setStorage(KEYS.WORD_MAP, wordMaps);

  // 전체 학습한 단어 수 업데이트
  if (learnedIncrement !== 0) {
    const latestUserData = getStorage(KEYS.USER_DATA);
    if (latestUserData) {
      latestUserData.learned = Math.max(0, (latestUserData.learned || 0) + learnedIncrement);
      setStorage(KEYS.USER_DATA, latestUserData);
    }
  }

  return true;
};
