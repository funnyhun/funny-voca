import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing in environment variables.");
}

/**
 * Supabase 클라이언트 인스턴스입니다.
 * [Used In] src/api/* (DB 통신 모듈)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase 1,000개 데이터 조회 제한을 우회하기 위해 페이징(range)을 사용하여 전체 데이터를 수집합니다.
 * @param {Function} queryBuilderFn - range() 메서드를 제외한 Supabase 쿼리 빌더를 생성하여 반환하는 함수
 * @param {number} [pageSize=1000] - 한 페이지당 가져올 개수
 * @returns {Promise<Array>} 수집된 전체 데이터 목록
 */
export const fetchPages = async (queryBuilderFn, pageSize = 1000) => {
  let allData = [];
  let from = 0;
  
  while (true) {
    const query = queryBuilderFn();
    const { data, error } = await query.range(from, from + pageSize - 1);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      break;
    }
    
    allData = allData.concat(data);
    
    if (data.length < pageSize) {
      break;
    }
    
    from += pageSize;
  }
  
  return allData;
};
