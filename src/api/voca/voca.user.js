import { buildWordMaps } from "./voca.shared";
import { supabase, fetchPages } from "@/api/client";
import { getStorage, setStorage, KEYS } from "@/utils/storage";

/**
 * 로그인 사용자의 단어 학습 데이터를 초기화하고 DB와 동기화합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @param {string} level - 선택된 레벨
 * @returns {Promise<Object|null>} 생성된 userData 및 wordMap 상태
 */
export const postVoca = async (userId, level) => {
  if (!userId) return null;

  try {
    const wordMaps = await buildWordMaps();
    if (!wordMaps) {
      console.error("[API/Voca/User] 단어 목록 로드 실패");
      return null;
    }

    setStorage(KEYS.WORD_MAP, wordMaps);

    // Supabase Voca 테이블에 초기값 Upsert (모두 status: false)
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
            onConflict: "user_id, word_id",
          });
        if (upsertError) {
          console.error("[API/Voca/User] Voca 초기 동기화 실패:", upsertError.message);
        }
      }
    }

    const now = new Date();
    const userData = {
      startedTime: now.setHours(0, 0, 0, 0),
      continued: 0,
      today: 0,
      learned: 0,
      selected: 0,
      level,
    };
    setStorage(KEYS.USER_DATA, userData);

    return { userData, wordMap: targetWordMap };
  } catch (err) {
    console.error("[API/Voca/User] Critical postVoca Error:", err);
    return null;
  }
};

/**
 * 로그인 사용자의 DB 단어 학습 데이터를 조회하여 로컬 캐시를 최신화하고 반환합니다.
 * @param {string} userId - Supabase 사용자 UUID
 * @param {string} level - 조회할 레벨
 * @returns {Promise<Array>} 단어 학습 맵 리스트
 */
export const getVoca = async (userId, level) => {
  if (!userId) return [];

  let targetLevel = level;
  if (!targetLevel) {
    const userData = getStorage(KEYS.USER_DATA);
    targetLevel = userData?.level || "default";
  }

  try {
    // Voca 테이블에서 학습 상태 조회
    let userVoca = [];
    try {
      userVoca = await fetchPages(() =>
        supabase
          .from("Voca")
          .select("word_id, status")
          .eq("user_id", userId)
      );
    } catch (vocaError) {
      console.error("[API/Voca/User] Voca DB 조회 실패:", vocaError.message);
      const wordMaps = getStorage(KEYS.WORD_MAP);
      return wordMaps ? (wordMaps[targetLevel] || []) : [];
    }

    // statusMap 구성
    const statusMap = {};
    let totalLearned = 0;
    if (userVoca) {
      userVoca.forEach(item => {
        statusMap[item.word_id] = item.status;
        if (item.status === true) totalLearned++;
      });
    }

    const wordMaps = await buildWordMaps(statusMap);
    if (!wordMaps) {
      const cached = getStorage(KEYS.WORD_MAP);
      return cached ? (cached[targetLevel] || []) : [];
    }

    // 캐시 업데이트
    setStorage(KEYS.WORD_MAP, wordMaps);

    const userData = getStorage(KEYS.USER_DATA) || {};
    setStorage(KEYS.USER_DATA, { ...userData, learned: totalLearned, level: targetLevel });

    return wordMaps[targetLevel] || [];
  } catch (err) {
    console.error("[API/Voca/User] Critical getVoca Error:", err);
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
    const { error } = await supabase
      .from("Voca")
      .update({ status })
      .eq("user_id", userId)
      .eq("word_id", wordId);

    if (error) {
      console.error("[API/Voca/User] DB 학습 상태 업데이트 실패:", error.message);
      return false;
    }

    // 로컬 캐시 즉시 업데이트
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

      if (learnedIncrement !== 0) {
        userData.learned = Math.max(0, (userData.learned || 0) + learnedIncrement);
        setStorage(KEYS.USER_DATA, userData);
      }
    }

    return true;
  } catch (err) {
    console.error("[API/Voca/User] Critical updateVoca Error:", err);
    return false;
  }
};
