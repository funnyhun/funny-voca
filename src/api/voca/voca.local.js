import { supabase, getVocaCache, setVocaCache, getProfileCache, setProfileCache, clearAllCache } from "@/api/common";

// ============================================================================
// [내장된 Voca 정렬 및 Schedule 재배정 비즈니스 로직 (구 voca.shared.js)]
// ============================================================================

/**
 * category_en 문자열(예: 'marketing_1', 'general_office_2')에서 접미사를 제거하고
 * 순수 대카테고리 식별자(예: 'marketing', 'general_office')를 정밀 추출합니다.
 */
const getBaseCategory = (categoryEn) => {
  if (!categoryEn) return '';
  return categoryEn.replace(/_\d+$/, '');
};

/**
 * voca_label 문자열(예: '700-marketing_1')에서 대카테고리 식별자(예: 'marketing')를 정밀 추출합니다.
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
 */
const extractCategoryOrder = (vocaList) => {
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
 */
export const calculateNewSchedule = (allChunks, existingVocaList = [], defaultCategoryOrder = []) => {
  const flatExisting = Array.isArray(existingVocaList)
    ? existingVocaList
    : Object.values(existingVocaList || {}).flat().filter(Boolean);

  let categoryOrder = extractCategoryOrder(flatExisting);
  if (categoryOrder.length === 0) {
    categoryOrder = [...defaultCategoryOrder];
  }

  const categoryWeight = {};
  categoryOrder.forEach((cat, index) => {
    categoryWeight[cat] = index;
  });

  const sortedChunks = [...allChunks].sort((a, b) => {
    const baseA = getBaseCategory(a.category_en);
    const baseB = getBaseCategory(b.category_en);

    const weightA = categoryWeight[baseA] !== undefined ? categoryWeight[baseA] : 999;
    const weightB = categoryWeight[baseB] !== undefined ? categoryWeight[baseB] : 999;

    if (weightA !== weightB) {
      return weightA - weightB;
    }

    if (a.level !== b.level) {
      return a.level - b.level;
    }

    return a.category_en.localeCompare(b.category_en);
  });

  return sortedChunks.map((chunk, index) => {
    const existing = flatExisting.find(
      (ev) => ev.voca_label === `${chunk.level}-${chunk.category_en}`
    );

    return {
      voca_label: `${chunk.level}-${chunk.category_en}`,
      done: existing ? existing.done : [],
      status: existing ? existing.status : false,
      completed_at: existing ? existing.completed_at : null,
      schedule: index + 1,
      word: chunk.word_ids || [],
      category_kr: chunk.category_kr || '',
    };
  });
};

// ============================================================================
// [로컬 Voca 엔진 비즈니스 API]
// ============================================================================

/**
 * 오늘 날짜를 YYYY-MM-DD 문자열 포맷으로 가져옵니다.
 * @returns {string} YYYY-MM-DD 날짜 문자열
 */
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 로컬 스토리지에서 Voca 전체 목록을 schedule 오름차순으로 조회하고 캐시를 반환합니다.
 * @returns {Promise<Object>} 레벨별 그룹화된 Voca 객체 { 700: [], 800: [], 900: [] }
 */
export const getLocalVocaList = async () => {
  let vocaList = getVocaCache();

  if (!vocaList || Array.isArray(vocaList) || Object.keys(vocaList).length === 0) {
    try {
      const [chunksResult, schedulesResult] = await Promise.all([
        supabase.from("Chunk").select("*"),
        supabase.from("Schedule").select("category_en").order("schedule", { ascending: true })
      ]);

      const targetChunks = chunksResult.data || [];
      const defaultSchedules = schedulesResult.data || [];
      const defaultCategoryOrder = defaultSchedules.map((s) => s.category_en);

      const grouped = {
        700: [],
        800: [],
        900: []
      };

      if (targetChunks && targetChunks.length > 0) {
        [700, 800, 900].forEach((lvl) => {
          const levelChunks = targetChunks.filter((c) => Number(c.level) <= Number(lvl));
          if (levelChunks.length > 0) {
            grouped[lvl] = calculateNewSchedule(levelChunks, [], defaultCategoryOrder);
          }
        });

        vocaList = grouped;
        setVocaCache(vocaList);

        const profile = getProfileCache();
        const activeLevel = profile.level || 700;
        setProfileCache({
          level: activeLevel,
          selected: profile.selected || vocaList[activeLevel]?.[0]?.voca_label || "",
          completed_date: null,
          learned: 0,
        });
      }
    } catch (err) {
      console.error("[LocalVoca] getLocalVocaList 초기 구축 에러:", err);
      vocaList = { 700: [], 800: [], 900: [] };
    }
  }

  if (vocaList && !Array.isArray(vocaList)) {
    Object.keys(vocaList).forEach((lvl) => {
      if (Array.isArray(vocaList[lvl])) {
        vocaList[lvl].sort((a, b) => a.schedule - b.schedule);
      }
    });
  }

  return vocaList || { 700: [], 800: [], 900: [] };
};

/**
 * 특정 단어의 완료 상태를 낙관적으로 갱신하고 자동 전진 및 완료 미션을 정밀 수행합니다.
 */
export const updateLocalWordStatus = async (wordId, status) => {
  try {
    const vocaList = await getLocalVocaList();
    if (!vocaList || Array.isArray(vocaList)) return null;

    let targetChunk = null;
    let targetLevelStr = null;

    Object.keys(vocaList).forEach((levelStr) => {
      if (!Array.isArray(vocaList[levelStr])) return;

      vocaList[levelStr] = vocaList[levelStr].map((chunk) => {
        const isTarget = chunk.word.includes(wordId) || 
                         chunk.word.includes(String(wordId)) || 
                         chunk.word.includes(Number(wordId));

        if (!isTarget) return chunk;

        targetLevelStr = levelStr;
        let nextDone = Array.isArray(chunk.done) ? [...chunk.done] : [];
        const strId = String(wordId);
        const numId = Number(wordId);

        if (status) {
          if (!nextDone.includes(strId) && !nextDone.includes(numId)) {
            nextDone.push(wordId);
          }
        } else {
          nextDone = nextDone.filter((id) => String(id) !== strId && Number(id) !== numId);
        }

        const nextChunkStatus = nextDone.length === chunk.word.length;
        targetChunk = { ...chunk, done: nextDone, status: nextChunkStatus };
        return targetChunk;
      });
    });

    if (!targetChunk || !targetLevelStr) {
      console.warn("[LocalVoca] 해당 단어를 포함한 청크를 로컬에서 찾을 수 없습니다:", wordId);
      return null;
    }

    setVocaCache(vocaList);

    const currentLevelVoca = vocaList[targetLevelStr] || [];
    setProfileCache({
      learned: currentLevelVoca.filter((v) => v.status === true).length
    });

    return { targetChunk, updatedVocaList: vocaList };
  } catch (err) {
    console.error("[LocalVoca] updateLocalWordStatus 에러:", err);
    return null;
  }
};

/**
 * 카테고리 스왑 및 레벨 마이그레이션(reschedule) 연산을 로컬 스토리지 캐시 기준으로 실행합니다.
 */
export const rescheduleLocal = async (targetLevel, swapCategories = null, isReset = false, defaultCategoryOrder = [], targetChunks = []) => {
  try {
    let vocaList = getVocaCache() || { 700: [], 800: [], 900: [] };
    if (Array.isArray(vocaList)) {
      vocaList = { 700: [], 800: [], 900: [] };
    }

    if (swapCategories) {
      const { catA, catB } = swapCategories;
      const currentLevelVoca = vocaList[targetLevel] || [];

      const listA = currentLevelVoca.filter((v) => v.voca_label.includes(`-${catA}`));
      const listB = currentLevelVoca.filter((v) => v.voca_label.includes(`-${catB}`));

      if (listA.length === 0 || listB.length === 0) {
        console.error("[LocalVoca] 스왑 대상 로컬 데이터가 없습니다.");
        return null;
      }

      const schedA = listA.map((v) => v.schedule).sort((x, y) => x - y);
      const schedB = listB.map((v) => v.schedule).sort((x, y) => x - y);

      const matchLengthA = Math.min(listA.length, schedB.length);
      listA.forEach((v, index) => {
        if (index < matchLengthA) v.schedule = schedB[index];
      });

      const matchLengthB = Math.min(listB.length, schedA.length);
      listB.forEach((v, index) => {
        if (index < matchLengthB) v.schedule = schedA[index];
      });

      vocaList[targetLevel] = currentLevelVoca;
      setVocaCache(vocaList);
      return vocaList;
    }

    if (!targetChunks || targetChunks.length === 0) {
      console.warn("[LocalVoca] targetChunks 누락 감지, Supabase로부터 동적 복구를 시도합니다.");
      const numericLevel = Number(targetLevel) || 700;
      const [schedResult, chunkResult] = await Promise.all([
        supabase.from("Schedule").select("category_en").order("schedule", { ascending: true }),
        supabase.from("Chunk").select("*").lte("level", numericLevel)
      ]);
      
      if (schedResult.error) throw new Error(`[Schedule Load Failed (Local)]: ${schedResult.error.message}`);
      if (chunkResult.error) throw new Error(`[Chunk Load Failed (Local)]: ${chunkResult.error.message}`);

      defaultCategoryOrder = (schedResult.data || []).map((s) => s.category_en);
      targetChunks = chunkResult.data || [];

      if (!targetChunks || targetChunks.length === 0) {
        console.error("[LocalVoca] 스케줄 계산에 필요한 Chunk 데이터가 부족합니다.");
        return null;
      }
    }

    const numericLevel = Number(targetLevel) || 700;
    const filterOldList = isReset ? [] : Object.values(vocaList).flat().filter(Boolean);
    const newVocaList = calculateNewSchedule(targetChunks, filterOldList, defaultCategoryOrder);

    vocaList[numericLevel] = newVocaList;
    setVocaCache(vocaList);

    setProfileCache({
      selected: newVocaList[0]?.voca_label || ""
    });

    return vocaList;
  } catch (err) {
    console.error("[LocalVoca] rescheduleLocal 에러:", err);
    return null;
  }
};

/**
 * 퀴즈 완료 시 특정 청크의 완료 상태(status) 및 completed_at 날짜를 로컬 스토리지에 반영하고,
 * 연속 학습일(continued), completed_date 및 selected 다음 청크 자동 전진을 총괄적으로 수행합니다.
 */
export const updateLocalVocaStatus = async (vocaLabel, doneList = [], status = false) => {
  try {
    const vocaList = await getLocalVocaList();
    if (!vocaList || Array.isArray(vocaList)) return null;

    let targetChunk = null;
    const targetLevelStr = vocaLabel.split("-")[0];

    if (vocaList[targetLevelStr]) {
      vocaList[targetLevelStr] = vocaList[targetLevelStr].map((chunk) => {
        if (chunk.voca_label !== vocaLabel) return chunk;

        const todayStr = getTodayString();
        targetChunk = {
          ...chunk,
          done: doneList || chunk.done, // 최종 완료된 단어 ID 목록 적용
          status: status,
          completed_at: status ? todayStr : null
        };
        return targetChunk;
      });
    }

    if (!targetChunk) {
      console.warn("[LocalVoca] 해당 청크를 로컬에서 찾을 수 없습니다:", vocaLabel);
      return null;
    }

    setVocaCache(vocaList);

    const profile = getProfileCache();
    const currentLevelVoca = vocaList[targetLevelStr] || [];
    const updatedProfileFields = {};

    if (status === true) {
      const todayStr = getTodayString();
      
      // Streak (continued) 연산 및 중복 가산 방지
      const isAlreadyDoneToday = profile.completed_date === todayStr;

      if (isAlreadyDoneToday) {
        // 오늘 이미 학습을 완료한 상태라면 completed_date만 유지하고 Streak 가산 생략
        updatedProfileFields.completed_date = todayStr;
      } else {
        updatedProfileFields.completed_date = todayStr;

        // 어제 날짜(YYYY-MM-DD)로 완료된 청크가 있는지 조회
        const msToDay = 86400000;
        const yesterday = new Date(Date.now() - msToDay);
        const yStr = String(yesterday.getFullYear());
        const mStr = String(yesterday.getMonth() + 1).padStart(2, "0");
        const dStr = String(yesterday.getDate()).padStart(2, "0");
        const yesterdayStr = `${yStr}-${mStr}-${dStr}`;

        const hasYesterdayDone = currentLevelVoca.some((c) => c.completed_at === yesterdayStr);

        if (hasYesterdayDone) {
          updatedProfileFields.continued = (profile.continued || 0) + 1;
        } else {
          updatedProfileFields.continued = 1;
        }
      }

      // User.selected 자동 전진 처리
      const sortedVoca = [...currentLevelVoca].sort((a, b) => a.schedule - b.schedule);
      const nextTodoChunk = sortedVoca.find((v) => v.status === false);
      if (nextTodoChunk) {
        updatedProfileFields.selected = nextTodoChunk.voca_label;
      }
    }

    updatedProfileFields.learned = currentLevelVoca.filter((v) => v.status === true).length;
    setProfileCache(updatedProfileFields);

    return { targetChunk, updatedVocaList: vocaList };
  } catch (err) {
    console.error("[LocalVoca] updateLocalVocaStatus 에러:", err);
    return null;
  }
};

/**
 * 로컬 캐시를 완전히 청소합니다 (공장 초기화).
 */
export const deleteLocalVoca = () => {
  clearAllCache();
};
