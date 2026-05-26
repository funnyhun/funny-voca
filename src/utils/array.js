/**
 * 배열을 무작위로 섞습니다 (Fisher-Yates).
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
