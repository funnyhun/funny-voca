import { supabase } from "../common/supabase";
import { getStorage, setStorage, KEYS } from "../util/storage";

/**
 * 로그인 사용자의 단어 학습 데이터를 초기화하고 DB와 동기화합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @param {string} level - 선택된 레벨
 * @returns {Promise<Object|null>} 생성된 userData 및 wordMap 상태
 */
export const postVoca = async (userId, level) => {
  if (!userId) return null;

  try {
    // 1. 단어 데이터 로드
    const { data: words, error: wordError } = await supabase
      .from("Word")
      .select("word_id, level, day, category");
    
    if (wordError || !words) {
      console.error("[API/User] 단어 목록 로드 실패:", wordError?.message);
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

    // 4. Supabase Voca 테이블에 초기값 Upsert (모두 status: false)
    const vocaInserts = [];
    const targetWordMap = wordMaps[level] || [];
    targetWordMap.forEach((dayObj) => {
      dayObj.word.forEach((id) => {
        vocaInserts.push({
          user_id: userId,
          word_id: id,
          day_number: dayObj.day,
          status: false,
        });
      });
    });

    if (vocaInserts.length > 0) {
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < vocaInserts.length; i += CHUNK_SIZE) {
        const { error: upsertError } = await supabase
          .from("Voca")
          .upsert(vocaInserts.slice(i, i + CHUNK_SIZE), { 
            onConflict: 'user_id, word_id' 
          });
        if (upsertError) {
          console.error("[API/User] Voca 초기 동기화 실패:", upsertError.message);
        }
      }
    }

    // 5. 사용자 기본 데이터 로컬스토리지 초기화
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

    return { userData, wordMap: targetWordMap };
  } catch (err) {
    console.error("[API/User] Critical postVoca Error:", err);
    return null;
  }
};

/**
 * 로그인 사용자의 DB 단어 학습 데이터를 조회하여 로컬스토리지 캐시를 최신화하고 반환합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @param {string} level - 조회할 레벨 (예: "default", "800", "900")
 * @returns {Promise<Array>} 단어 학습 맵 리스트
 */
export const getVoca = async (userId, level) => {
  if (!userId) return [];

  // 레벨 파라미터가 명확하지 않으면 로컬 userData 기준 처리
  let targetLevel = level;
  if (!targetLevel) {
    const userData = getStorage(KEYS.USER_DATA);
    targetLevel = userData?.level || "default";
  }

  // level이 숫자로 DB에 저장될 수도 있어 (예: default -> 700) 매핑 필요
  let dbLevel = 700;
  if (targetLevel === "800") dbLevel = 800;
  if (targetLevel === "900") dbLevel = 900;

  try {
    // 1. Supabase Voca 테이블에서 해당 유저의 학습 상태 조회
    const { data: userVoca, error: vocaError } = await supabase
      .from("Voca")
      .select("word_id, status")
      .eq("user_id", userId);

    if (vocaError) {
      console.error("[API/User] Voca DB 조회 실패:", vocaError.message);
      // DB 에러 시 로컬 캐시 데이터 반환
      const wordMaps = getStorage(KEYS.WORD_MAP);
      return wordMaps ? (wordMaps[targetLevel] || []) : [];
    }

    // 2. 단어별 status 매핑을 O(1) 조회용 객체로 변환
    const statusMap = {};
    let totalLearned = 0;
    if (userVoca) {
      userVoca.forEach(item => {
        statusMap[item.word_id] = item.status;
        if (item.status === true) {
          totalLearned++;
        }
      });
    }

    // 3. Word 테이블에서 전체 단어 로드하여 맵 재구성
    const { data: words, error: wordError } = await supabase
      .from("Word")
      .select("word_id, level, day, category");

    if (wordError || !words) {
      console.error("[API/User] Word 테이블 조회 실패:", wordError?.message);
      const wordMaps = getStorage(KEYS.WORD_MAP);
      return wordMaps ? (wordMaps[targetLevel] || []) : [];
    }

    const tempMaps = {};

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

    const wordMaps = {};
    Object.keys(tempMaps).forEach(l => {
      const categories = Object.values(tempMaps[l]);
      categories.sort((a, b) => (a.day - b.day) || a.category.localeCompare(b.category));

      wordMaps[l] = categories.map((c, idx) => {
        // 이 카테고리의 각 단어에 대한 status 적용 및 finishedCount 계산
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
          done: finishedCount === length
        };
      });
    });

    // 4. 로컬스토리지 WORD_MAP 캐시 업데이트
    setStorage(KEYS.WORD_MAP, wordMaps);

    // 5. 로컬스토리지 USER_DATA 캐시 업데이트 (학습한 단어 수 동기화)
    const userData = getStorage(KEYS.USER_DATA) || {};
    const updatedUserData = {
      ...userData,
      learned: totalLearned,
      level: targetLevel,
    };
    setStorage(KEYS.USER_DATA, updatedUserData);

    return wordMaps[targetLevel] || [];
  } catch (err) {
    console.error("[API/User] Critical getVoca Error:", err);
    const wordMaps = getStorage(KEYS.WORD_MAP);
    return wordMaps ? (wordMaps[targetLevel] || []) : [];
  }
};

/**
 * 로그인 사용자의 특정 단어 학습 상태를 DB 및 로컬 캐시에 업데이트합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @param {number} wordId - 단어 ID
 * @param {boolean} status - 학습 완료 여부
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export const updateVoca = async (userId, wordId, status = true) => {
  if (!userId || !wordId) return false;

  try {
    // 1. Supabase Voca 테이블 업데이트
    const { error } = await supabase
      .from("Voca")
      .update({ status })
      .eq("user_id", userId)
      .eq("word_id", wordId);

    if (error) {
      console.error("[API/User] DB 학습 상태 업데이트 실패:", error.message);
      return false;
    }

    // 2. 로컬스토리지 WORD_MAP 캐시 즉시 업데이트
    const wordMaps = getStorage(KEYS.WORD_MAP);
    const userData = getStorage(KEYS.USER_DATA);

    if (wordMaps && userData) {
      const currentLevel = userData.level || "default";
      const wordMap = wordMaps[currentLevel] || [];
      let learnedIncrement = 0;

      const updatedWordMap = wordMap.map((day) => {
        if (!day || !day.word.includes(wordId)) return day;

        const wordStatus = { ...(day.wordStatus || {}) };
        const wasAlreadyDone = wordStatus[wordId] === true;
        wordStatus[wordId] = status;

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

      // 3. 로컬스토리지 USER_DATA 캐시 즉시 업데이트
      if (learnedIncrement !== 0) {
        userData.learned = Math.max(0, (userData.learned || 0) + learnedIncrement);
        setStorage(KEYS.USER_DATA, userData);
      }
    }

    return true;
  } catch (err) {
    console.error("[API/User] Critical updateVoca Error:", err);
    return false;
  }
};
