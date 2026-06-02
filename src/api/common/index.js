import { supabase } from "./supabase";
import { getMasterCache, setMasterCache } from "./storage";

export { supabase };
export * from "./storage";

/**
 * 로컬 캐시 우선 조회를 지원하는 공통 데이터 로더 헬퍼입니다.
 * 캐시가 존재하면 즉시 반환하고, 없으면 fetchFn을 통해 채워 넣고 반환합니다.
 * @param {string} cacheKey - 캐시 키 이름 (KEYS 상수 혹은 문자열)
 * @param {Function} fetchFn - 원격 데이터를 비동기 조회하는 프라미스 함수
 * @param {boolean} [forceDB=false] - 캐시를 무시하고 강제 동기화 여부
 * @returns {Promise<any>}
 */
export const getCachedData = async (cacheKey, fetchFn, forceDB = false) => {
  if (!forceDB) {
    const cached = getMasterCache(); // master 캐시 우선 확인
    if (cached && Object.keys(cached).length > 0) {
      return cached;
    }
  }
  const data = await fetchFn();
  if (data) {
    setMasterCache(data);
  }
  return data;
};
