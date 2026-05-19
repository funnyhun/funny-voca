// 1000 * 60 * 60 * 24
const msToDay = 86400000;

/**
 * 특정 시점으로부터 경과한 일수를 계산합니다.
 * [Used In] src/pages/Home/util.js, src/pages/Play/util.js
 * @param {Date|string} now 현재 시점
 * @param {Date|string} startedTime 시작 시점
 * @returns {number} 경과 일수
 */
export const calculateDate = (now, startedTime) => {
  const currentTime = new Date(now).setHours(0, 0, 0, 0);
  const diff = currentTime - startedTime;

  return Math.floor(diff / msToDay);
};


/**
 * 배열을 무작위로 섞습니다 (Fisher-Yates).
 * [Used In] src/pages/Play/Play.jsx
 * @param {Array} array 원본 배열
 * @returns {Array} 섞인 새 배열
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * 연도와 월에 해당하는 캘린더 데이터를 생성하고 학습 완료 상태를 매핑합니다.
 * [Used In] src/pages/Home/Calendar.jsx
 * @param {number} year 연도
 * @param {number} month 월 (0-11)
 * @param {number} startedTime 학습 시작 시점 (ms)
 * @param {Array} wordMap 학습 데이터 배열
 * @returns {Array} 캘린더 데이터 행렬
 */
export const calculateCalendarData = (year, month, startedTime, wordMap) => {
  const start = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const week = Math.ceil((start + total) / 7);

  const data = Array.from({ length: week }, () => Array(7).fill(false));

  let counter = 1;

  for (let m = 0; m < week; m++) {
    for (let d = 0; d < 7; d++) {
      if ((m === 0 && d < start) || counter > total) {
        data[m][d] = null;
        continue;
      }

      const targetDate = new Date(year, month, counter);
      const idx = calculateDate(targetDate, startedTime);
      const valid = idx >= 0 && wordMap[idx];

      data[m][d] = {
        value: counter,
        status: valid ? wordMap[idx].done : null,
      };
      counter++;
    }
  }

  return data;
};
