/**
 * Voca 목록 데이터를 종전의 UI가 자연스럽게 호환되도록 가공해주는 변환 헬퍼입니다.
 * @param {Object} groupedList 레벨별로 그룹화된 Raw Voca 객체
 * @returns {Object} 가공 완료된 UI 대응 레벨별 그룹 객체
 */
export const parseMaster = (groupedList) => {
  const processed = {};
  Object.keys(groupedList || {}).forEach((level) => {
    processed[level] = (groupedList[level] || []).map((item) => ({
      ...item,
      category: item.voca_label.split("-")[1], // 카테고리 영문
      day: item.schedule, // 권장 순번 매핑
      level: parseInt(level) || 700, // UI 가시성을 위해 level 명시적 주입
    }));
  });
  return processed;
};
