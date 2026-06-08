/**
 * 로컬스토리지 접근 유틸리티 및 고수준 도메인 특화 캐시 API
 */

export const KEYS = {
  PROFILE: "profile",
  VOCA: "voca",
  THEME: "theme",
  MASTER: "master", // 마스터 단어 상세 데이터 캐시 키
};

/**
 * 로컬스토리지에서 데이터를 읽어옵니다 (캡슐화됨).
 */
const getStorage = (key) => {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item);
    } catch (e) {
      // JSON 파싱 실패 시 단순 문자열로 반환
      return item;
    }
  } catch (err) {
    console.error(`[Common/Storage] Read Error (${key}):`, err);
    return null;
  }
};

/**
 * 로컬스토리지에 데이터를 저장합니다 (캡슐화됨).
 */
const setStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[Common/Storage] Write Error (${key}):`, err);
  }
};

/**
 * 로컬스토리지에서 데이터를 삭제합니다 (캡슐화됨).
 */
const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error(`[Common/Storage] Remove Error (${key}):`, err);
  }
};

// ============================================================================
// 고수준 도메인 캐싱 API (추상화 인터페이스)
// ============================================================================

/**
 * 프로필 캐시 데이터를 조회합니다.
 * @returns {Object} 프로필 객체
 */
export const getProfileCache = () => {
  return getStorage(KEYS.PROFILE) || {};
};

/**
 * 프로필 캐시 데이터를 갱신합니다.
 * @param {Object} profileData - 업데이트할 프로필 속성
 * @returns {Object} 갱신 완료된 최종 프로필 객체
 */
export const setProfileCache = (profileData) => {
  const current = getProfileCache();
  const updated = { ...current, ...profileData };
  setStorage(KEYS.PROFILE, updated);
  return updated;
};

/**
 * Voca 목록 캐시 데이터를 조회합니다.
 * @returns {Object|null} 레벨별로 그룹화된 Voca 객체
 */
export const getVocaCache = () => {
  return getStorage(KEYS.VOCA);
};

/**
 * Voca 목록 캐시 데이터를 저장합니다.
 * @param {Object} vocaData - 저장할 Voca 객체
 */
export const setVocaCache = (vocaData) => {
  setStorage(KEYS.VOCA, vocaData);
};

/**
 * 단어 마스터 데이터 캐시를 조회합니다.
 * @returns {Object} 단어 ID를 키로 하는 단어 데이터 맵
 */
export const getMasterCache = () => {
  return getStorage(KEYS.MASTER) || {};
};

/**
 * 단어 마스터 데이터 캐시를 저장합니다.
 * @param {Object} masterData - 저장할 마스터 데이터 맵
 */
export const setMasterCache = (masterData) => {
  setStorage(KEYS.MASTER, masterData);
};

/**
 * 테마 설정을 조회합니다.
 */
export const getThemeCache = () => {
  return getStorage(KEYS.THEME);
};

/**
 * 테마 설정을 저장합니다.
 */
export const setThemeCache = (theme) => {
  setStorage(KEYS.THEME, theme);
};

/**
 * 공장 초기화 정책에 의거하여 캐시 스토리지를 전체 포맷합니다.
 */
export const clearAllCache = () => {
  removeStorage(KEYS.PROFILE);
  removeStorage(KEYS.VOCA);
  removeStorage(KEYS.MASTER);
};
