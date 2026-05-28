// 1000 * 60 * 60 * 24
const msToDay = 86400000;

/**
 * 특정 시점으로부터 경과한 일수를 계산합니다.
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
 * 연도와 월에 해당하는 캘린더 데이터를 생성하고 학습 완료 상태를 매핑합니다.
 * @param {number} year 연도
 * @param {number} month 월 (0-11)
 * @param {number} startedTime 학습 시작 시점 (ms)
 * @param {Array} wordMap 학습 데이터 배열
 * @returns {Array} 캘린더 데이터 행렬
 */
export const calculateCalendarData = (year, month, startedTime, voca, activeLevel = 700) => {
  const start = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const week = Math.ceil((start + total) / 7);

  const data = Array.from({ length: week }, () => Array(7).fill(false));

  // voca에서 모든 레벨의 completed_at 날짜 문자열(YYYY-MM-DD)들을 추출하여 유니크하게 수집
  const completedDates = new Set();
  if (voca) {
    Object.values(voca).forEach((chunkList) => {
      if (Array.isArray(chunkList)) {
        chunkList.forEach((chunk) => {
          if (chunk.completed_at) {
            completedDates.add(chunk.completed_at);
          }
        });
      }
    });
  }

  let counter = 1;

  for (let m = 0; m < week; m++) {
    for (let d = 0; d < 7; d++) {
      if ((m === 0 && d < start) || counter > total) {
        data[m][d] = null;
        continue;
      }

      // 캘린더의 각 날짜 counter를 YYYY-MM-DD 형태의 문자열로 변환
      const yStr = String(year);
      const mStr = String(month + 1).padStart(2, "0");
      const dStr = String(counter).padStart(2, "0");
      const targetDateStr = `${yStr}-${mStr}-${dStr}`;

      const isLearned = completedDates.has(targetDateStr);

      data[m][d] = {
        value: counter,
        status: isLearned,
      };
      counter++;
    }
  }

  return data;
};
