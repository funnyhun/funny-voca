/**
 * @typedef {Object} WordDay
 * @property {string} id - Day ID (e.g., "day1")
 * @property {string[]} word - Array of word IDs
 * @property {number} [length] - Total number of words in this day
 * @property {Object.<string, boolean>} [wordStatus] - Word status map for guest mode
 * @property {boolean} [done] - Whether the day is completed
 */

/**
 * @typedef {Object} ProcessedDay
 * @property {string} id
 * @property {string[]} word
 * @property {number} finishedCount - Number of learned words
 * @property {boolean} done - Completion status
 * @property {number} progress - Progress percentage (0-100)
 */

/**
 * 기반 wordMap에 학습 상태를 병합하여 UI용 데이터를 생성합니다.
 * 
 * @param {WordDay[]} baseWordMap - 기초 단어 배치 데이터
 * @param {Object.<string, boolean>} wordStatusMap - 사용자의 단어별 학습 상태 (ID -> status)
 * @returns {ProcessedDay[]} UI 렌더링에 최적화된 가공 데이터
 */
export const processWordMap = (baseWordMap, wordStatusMap) => {
  if (!Array.isArray(baseWordMap)) return [];

  return baseWordMap.map((day) => {
    if (!day) return null;
    
    let finishedCount = 0;
    const wordList = day.word || [];
    
    wordList.forEach((id) => {
      if (wordStatusMap[id] === true) finishedCount++;
    });

    const length = day.length || wordList.length || 1;

    return {
      ...day,
      finishedCount,
      done: finishedCount === length,
      progress: Math.floor((finishedCount / length) * 100),
    };
  }).filter(Boolean);
};

/**
 * Guest 유저의 로컬 데이터를 기반으로 wordStatusMap을 생성합니다.
 * 
 * @param {WordDay[]} wordMap - 로컬 스토리지에서 불러온 원본 wordMap
 * @returns {Object.<string, boolean>} 모든 단어의 학습 상태를 담은 맵
 */
export const createGuestStatusMap = (wordMap) => {
  if (!Array.isArray(wordMap)) return {};

  const statusMap = {};
  wordMap.forEach((day) => {
    if (!day) return;
    (day.word || []).forEach((wordId) => {
      // 새로운 데이터 구조(wordStatus) 우선, 없으면 레거시(done) 참고
      const status = day.wordStatus
        ? (day.wordStatus[wordId] ?? false)
        : (day.done || false);
      statusMap[wordId] = status;
    });
  });
  return statusMap;
};
