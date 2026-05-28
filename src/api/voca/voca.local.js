import { supabase } from "@/api/client";
import { getStorage, setStorage, removeStorage, KEYS } from "@/utils/storage";

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
  let vocaList = getStorage(KEYS.VOCA);

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
          const levelChunks = targetChunks.filter((c) => String(c.level) === String(lvl));
          if (levelChunks.length > 0) {
            grouped[lvl] = calculateNewSchedule(levelChunks, [], defaultCategoryOrder);
          }
        });

        vocaList = grouped;
        setStorage(KEYS.VOCA, vocaList);

        const profile = getStorage(KEYS.PROFILE) || {};
        const activeLevel = profile.level || 700;
        setStorage(KEYS.PROFILE, {
          ...profile,
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

    setStorage(KEYS.VOCA, vocaList);

    if (targetChunk.status === true) {
      const profile = getStorage(KEYS.PROFILE) || {};
      const todayStr = getTodayString();
      profile.completed_date = todayStr;

      const currentLevelVoca = vocaList[targetLevelStr] || [];
      const sortedVoca = [...currentLevelVoca].sort((a, b) => a.schedule - b.schedule);
      const nextTodoChunk = sortedVoca.find((v) => v.status === false);

      if (nextTodoChunk) {
        profile.selected = nextTodoChunk.voca_label;
      }

      profile.learned = currentLevelVoca.filter((v) => v.status === true).length;
      setStorage(KEYS.PROFILE, profile);
    } else {
      const profile = getStorage(KEYS.PROFILE) || {};
      const currentLevelVoca = vocaList[targetLevelStr] || [];
      profile.learned = currentLevelVoca.filter((v) => v.status === true).length;
      setStorage(KEYS.PROFILE, profile);
    }

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
    let vocaList = getStorage(KEYS.VOCA) || { 700: [], 800: [], 900: [] };
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
      setStorage(KEYS.VOCA, vocaList);
      return vocaList;
    }

    if (!targetChunks || targetChunks.length === 0) {
      console.warn("[LocalVoca] targetChunks 누락 감지, Supabase로부터 동적 복구를 시도합니다.");
      const numericLevel = Number(targetLevel) || 700;
      const [schedResult, chunkResult] = await Promise.all([
        supabase.from("Schedule").select("category_en").order("schedule", { ascending: true }),
        supabase.from("Chunk").select("*").eq("level", numericLevel)
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
    const filterOldList = isReset ? [] : (vocaList[numericLevel] || []);
    const newVocaList = calculateNewSchedule(targetChunks, filterOldList, defaultCategoryOrder);

    vocaList[numericLevel] = newVocaList;
    setStorage(KEYS.VOCA, vocaList);

    const profile = getStorage(KEYS.PROFILE) || {};
    profile.selected = newVocaList[0]?.voca_label || "";
    setStorage(KEYS.PROFILE, profile);

    return vocaList;
  } catch (err) {
    console.error("[LocalVoca] rescheduleLocal 에러:", err);
    return null;
  }
};

/**
 * 로컬 캐시를 완전히 청소합니다 (공장 초기화).
 */
export const deleteLocalVoca = () => {
  removeStorage(KEYS.PROFILE);
  removeStorage(KEYS.VOCA);
  removeStorage(KEYS.USER_DATA);
};
