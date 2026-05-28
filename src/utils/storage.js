/**
 * 로컬스토리지 접근 유틸리티 (도메인 무관)
 */

export const KEYS = {
  PROFILE: "profile",
  VOCA: "voca",
  USER_DATA: "userData",
  THEME: "theme",
  MASTER: "master", // 마스터 단어 상세 데이터 캐시 키
};

/**
 * 로컬스토리지에서 데이터를 읽어옵니다.
 * @param {string} key - KEYS 객체에 정의된 키 이름
 * @returns {any} 파싱된 데이터 또는 null
 */
export const getStorage = (key) => {
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
    console.error(`[Utils/Storage] Read Error (${key}):`, err);
    return null;
  }
};

/**
 * 로컬스토리지에 데이터를 저장합니다.
 * @param {string} key - KEYS 객체에 정의된 키 이름
 * @param {any} value - 저장할 데이터
 */
export const setStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[Utils/Storage] Write Error (${key}):`, err);
  }
};

/**
 * 로컬스토리지에서 데이터를 삭제합니다.
 * @param {string} key - KEYS 객체에 정의된 키 이름
 */
export const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error(`[Utils/Storage] Remove Error (${key}):`, err);
  }
};

/**
 * 로컬스토리지의 모든 데이터를 삭제합니다.
 */
export const clearStorage = () => {
  try {
    window.localStorage.clear();
  } catch (err) {
    console.error("[Utils/Storage] Clear Error:", err);
  }
};
