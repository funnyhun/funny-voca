import { buildVoca } from "./voca.shared";
import { getStorage, setStorage, KEYS } from "@/utils/storage";

/**
 * 게스트 사용자의 단어 학습 데이터를 초기화합니다.
 * @param {string} level - 선택된 레벨
 * @returns {Promise<Object|null>} 생성된 userData 및 wordMap 상태
 */
export const postVoca = async (level) => {
  try {
    const wordMaps = await buildVoca();
    if (!wordMaps) {
      console.error("[API/Voca/Guest] 단어 목록 로드 실패");
      return null;
    }

    setStorage(KEYS.VOCA, wordMaps);

    const now = new Date();
    const existingProfile = getStorage(KEYS.PROFILE) || {};
    const updatedProfile = {
      ...existingProfile,
      startedTime: now.setHours(0, 0, 0, 0),
      continued: 0,
      today: 0,
      learned: 0,
      selected: 0,
      level,
    };
    setStorage(KEYS.PROFILE, updatedProfile);

    return { profile: updatedProfile, voca: wordMaps[level] || [] };
  } catch (err) {
    console.error("[API/Voca/Guest] Critical postVoca Error:", err);
    return null;
  }
};

/**
 * 게스트 사용자의 전체 WORD_MAP 또는 특정 레벨의 단어 맵을 조회합니다.
 * @param {string} [level] - 조회할 레벨 (생략 시 USER_DATA의 레벨 기준)
 * @returns {Array} 단어 학습 맵 리스트
 */
export const getVoca = (level) => {
  const wordMaps = getStorage(KEYS.VOCA);
  if (!wordMaps) return [];

  if (level) return wordMaps[level] || [];

  const profile = getStorage(KEYS.PROFILE);
  const currentLevel = profile?.level || "default";
  return wordMaps[currentLevel] || [];
};

/**
 * 게스트 사용자의 특정 단어 학습 상태를 업데이트합니다.
 * @param {number} wordId - 단어 ID
 * @param {boolean} status - 학습 완료 여부
 * @returns {boolean} 업데이트 성공 여부
 */
export const updateVoca = (wordId, status = true) => {
  const wordMaps = getStorage(KEYS.VOCA);
  const profile = getStorage(KEYS.PROFILE);

  if (!wordMaps || !profile) return false;

  const currentLevel = profile.level || "default";
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
  setStorage(KEYS.VOCA, wordMaps);

  if (learnedIncrement !== 0) {
    const latestUserData = getStorage(KEYS.PROFILE);
    if (latestUserData) {
      latestUserData.learned = Math.max(0, (latestUserData.learned || 0) + learnedIncrement);
      setStorage(KEYS.PROFILE, latestUserData);
    }
  }

  return true;
};
