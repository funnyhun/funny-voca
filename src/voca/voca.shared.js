/**
 * voca.shared.js
 * 로그인 사용자와 게스트 모드에서 100% 동일한 정합성으로 정렬 및 대카테고리 추출 처리를 수행하기 위한 공통 비즈니스 로직 유틸리티 모듈입니다.
 */

/**
 * category_en 문자열(예: 'marketing_1', 'general_office_2')에서 접미사 숫자를 제거하고
 * 순수 대카테고리 식별자(예: 'marketing', 'general_office')를 정밀 추출합니다.
 * @param {string} categoryEn 세부 카테고리 식별자
 * @returns {string} 대카테고리 식별자
 */
export const getBaseCategory = (categoryEn) => {
  if (!categoryEn) return '';
  return categoryEn.replace(/_\d+$/, '');
};

/**
 * voca_label 문자열(예: '700-marketing_1')에서 대카테고리 식별자(예: 'marketing')를 정밀 추출합니다.
 * @param {string} vocaLabel 청크 식별 라벨
 * @returns {string} 대카테고리 식별자
 */
export const getBaseCategoryFromLabel = (vocaLabel) => {
  if (!vocaLabel) return '';
  const parts = vocaLabel.split('-');
  if (parts.length < 2) return '';
  const categoryEn = parts.slice(1).join('-');
  return getBaseCategory(categoryEn);
};

/**
 * 기존 Voca 목록에 이미 적용되어 있던 스왑 정보(schedule 값의 크기)를 분석하여,
 * 현재 사용자의 개인화된 대카테고리 정렬 순서 배열을 추출합니다.
 * @param {Array} vocaList 기존 Voca 행(객체) 목록
 * @returns {Array} 정렬된 대카테고리 영문명 배열
 */
export const extractCategoryOrder = (vocaList) => {
  if (!vocaList || vocaList.length === 0) return [];
  
  const categoryMinSchedule = {};
  vocaList.forEach((v) => {
    const baseCategory = getBaseCategoryFromLabel(v.voca_label);
    if (!baseCategory) return;
    
    if (categoryMinSchedule[baseCategory] === undefined || v.schedule < categoryMinSchedule[baseCategory]) {
      categoryMinSchedule[baseCategory] = v.schedule;
    }
  });

  // 각 대카테고리별 최소 schedule 번호를 기준으로 오름차순 정렬
  return Object.keys(categoryMinSchedule).sort((a, b) => categoryMinSchedule[a] - categoryMinSchedule[b]);
};

/**
 * 700, 800, 900 등 활성화된 레벨의 청크 데이터 조합을
 * 1순위 대카테고리 개인화 순서 -> 2순위 레벨 오름차순 -> 3순위 세부 청크 순서
 * 정렬 기준에 맞춰 정렬한 뒤, 1부터 N까지 촘촘하게 schedule 순번을 재부여합니다.
 * 
 * @param {Array} allChunks 데이터베이스 또는 로컬 스토리지의 활성 레벨 Chunk 목록
 * @param {Array} existingVocaList 사용자의 기존 Voca 목록 (스왑 상태 복구용)
 * @param {Array} defaultCategoryOrder Schedule 테이블 등에서 로드된 불변의 권장 대카테고리 순서
 * @returns {Array} schedule 순번이 재부여된 Voca 가상 삽입/갱신용 객체 목록
 */
export const calculateNewSchedule = (allChunks, existingVocaList = [], defaultCategoryOrder = []) => {
  // 1단계: 기존 Voca 목록이 있다면 사용자의 스왑 순서를 복구하고, 없으면 기본 권장 스케줄 순서 적용
  let categoryOrder = extractCategoryOrder(existingVocaList);
  if (categoryOrder.length === 0) {
    categoryOrder = [...defaultCategoryOrder];
  }

  // 2단계: 정렬 가중치 조회를 위한 맵 생성
  const categoryWeight = {};
  categoryOrder.forEach((cat, index) => {
    categoryWeight[cat] = index;
  });

  // 3단계: 정렬 공식 적용
  const sortedChunks = [...allChunks].sort((a, b) => {
    const baseA = getBaseCategory(a.category_en);
    const baseB = getBaseCategory(b.category_en);

    const weightA = categoryWeight[baseA] !== undefined ? categoryWeight[baseA] : 999;
    const weightB = categoryWeight[baseB] !== undefined ? categoryWeight[baseB] : 999;

    // 1순위: 대카테고리 상대적 가중치 오름차순
    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // 2순위: 레벨 오름차순 (level ASC)
    if (a.level !== b.level) {
      return a.level - b.level;
    }

    // 3순위: 세부 category_en 알파벳/접미사 순서 오름차순
    return a.category_en.localeCompare(b.category_en);
  });

  // 4단계: 촘촘하게 1부터 N까지 schedule 순서 갱신
  return sortedChunks.map((chunk, index) => {
    const existing = existingVocaList.find(
      (ev) => ev.voca_label === `${chunk.level}-${chunk.category_en}`
    );

    return {
      voca_label: `${chunk.level}-${chunk.category_en}`,
      done: existing ? existing.done : [],
      status: existing ? existing.status : false,
      schedule: index + 1,
    };
  });
};
