import { getSession } from "@/api/auth";
import { supabase, getProfileCache, setProfileCache } from "@/api/common";
import {
  getLocalVocaList,
  updateLocalVocaStatus,
  rescheduleLocal,
  deleteLocalVoca,
} from "./voca.local";
import {
  syncVocaStatusToRemote,
  syncRescheduleToRemote,
  deleteRemoteVoca,
} from "./voca.sync";

/**
 * 1. 로컬 스토리지 기반 Voca 목록 조회 (낙관적 & 오프라인 우선)
 * 캐시가 없을 시 내부적으로 Supabase에서 Chunk 목록을 다운로드하여 로컬 캐시를 초기 구축합니다.
 * @returns {Promise<Object>} 레벨별 그룹화된 Voca 객체 { 700: [], 800: [], 900: [] }
 */
export const getVocaList = async () => {
  // 로컬 엔진으로부터 즉시 캐시를 불러오거나 Anon-get으로 채워 빌드함
  return getLocalVocaList();
};



/**
 * 3. 스케줄 재배정 및 초기화 (로컬 우선 반영 + 비동기 마이그레이션 및 실시간 진행률 콜백 연동)
 * 
 * @param {number} targetLevel - 대상 레벨
 * @param {Object} [swapCategories=null] - 스왑할 카테고리 정보 { catA, catB }
 * @param {boolean} [isReset=false] - 학습 내역 리셋 여부
 * @param {Function} [onProgress] - 진행율 콜백 함수
 * @returns {Promise<Object|null>} 완료 후 갱신된 Voca 리스트
 */
export const reschedule = async (targetLevel, swapCategories = null, isReset = false, onProgress = null) => {
  try {
    // 1단계: 스케줄링에 필요한 기본 데이터 로드 (Schedule 순서 및 Chunk 데이터)
    let defaultCategoryOrder = [];
    let targetChunks = [];

    if (!swapCategories) {
      const [schedResult, chunkResult] = await Promise.all([
        supabase.from("Schedule").select("category_en").order("schedule", { ascending: true }),
        supabase.from("Chunk").select("*").lte("level", Number(targetLevel) || 700)
      ]);
      
      if (schedResult.error) throw new Error(`[Schedule Load Failed]: ${schedResult.error.message}`);
      if (chunkResult.error) throw new Error(`[Chunk Load Failed]: ${chunkResult.error.message}`);

      defaultCategoryOrder = (schedResult.data || []).map((s) => s.category_en);
      targetChunks = chunkResult.data || [];
    }

    // 2단계: 로컬에 즉시 스케줄 재배정 및 스왑 반영 (낙관적 적용)
    const updatedVocaList = await rescheduleLocal(
      targetLevel,
      swapCategories,
      isReset,
      defaultCategoryOrder,
      targetChunks
    );

    // 3단계: 세션 여부에 따라 원격 Supabase 백그라운드 동기화 가동
    getSession().then((session) => {
      if (session) {
        syncRescheduleToRemote(
          session.user.id,
          targetLevel,
          swapCategories,
          isReset,
          onProgress
        ).catch((err) => {
          console.error("[API/Voca] 원격 마이그레이션 백그라운드 동기화 실패:", err);
        });
      } else {
        // 게스트의 경우 가짜 지연 없이 즉시 진행률 100% 콜백 호출로 종료
        if (typeof onProgress === "function") {
          onProgress(100);
        }
      }
    });

    return updatedVocaList;
  } catch (err) {
    console.error("[API/Voca] reschedule 에러:", err);
    return null;
  }
};

/**
 * 4. 학습 레벨 변경 (로컬 우선 반영 + 비동기 DB 유저 컬럼 동기화)
 * 
 * @param {number} newLevel - 새로 설정할 레벨 (700, 800, 900)
 * @param {Function} [onProgress] - 진행율 콜백
 * @returns {Promise<boolean>} 성공 여부
 */
export const updateLevel = async (newLevel, onProgress = null) => {
  if (!newLevel) return false;

  try {
    // 1단계: 로컬 프로필 레벨 캐시 즉시 변경
    setProfileCache({ level: newLevel });

    // 2단계: 로컬 스케줄 재배정 실행
    const success = await reschedule(newLevel, null, false, onProgress);
    if (!success) return false;

    // 3단계: 백그라운드에서 Supabase User 테이블의 level 정보 갱신 동기화
    getSession().then((session) => {
      if (session) {
        supabase
          .from("User")
          .update({ level: newLevel })
          .eq("user_id", session.user.id)
          .catch((err) => {
            console.error("[API/Voca] User level 컬럼 동기화 실패:", err);
          });
      }
    });

    return true;
  } catch (err) {
    console.error("[API/Voca] updateLevel 에러:", err);
    return false;
  }
};

/**
 * 5. Voca 학습 데이터 전체 초기화 (완전 공장 초기화 정책)
 * 로컬 스토리지를 전면 파지하고, 로그인 사용자는 Supabase 원격 레코드까지 완전 파지합니다.
 * 
 * @returns {Promise<boolean>} 초기화 성공 여부
 */
export const deleteVoca = async () => {
  try {
    // 1단계: 로컬 캐시 즉각 삭제 (공장 초기화 완료)
    deleteLocalVoca();

    // 2단계: 세션 검사 후 Supabase 원격 레코드 전면 파지 비동기 수행
    getSession().then((session) => {
      if (session) {
        deleteRemoteVoca(session.user.id).catch((err) => {
          console.error("[API/Voca] 원격 DB 데이터 파지 실패:", err);
        });
      }
    });

    return true;
  } catch (err) {
    console.error("[API/Voca] deleteVoca 에러:", err);
    return false;
  }
};

/**
 * 6. 로그아웃 (인증 세션 해제 및 로컬 캐시 청소)
 */
export const logout = async () => {
  try {
    const session = await getSession();
    if (session) {
      await supabase.auth.signOut().catch((err) => console.error("SignOut 실패:", err));
    }
    
    // 로컬 스토리지 전면 청소
    deleteLocalVoca();
    return true;
  } catch (err) {
    console.error("[API/Voca] 로그아웃 에러:", err);
    return false;
  }
};

// ============================================================================
// [하위 호환성 유지용 임시 구버전 호환 래퍼 함수]
// ============================================================================
export const getVoca = async (level) => {
  return getVocaList();
};

export const postVoca = async (level) => {
  const parsedLevel = parseInt(level) || 700;
  return reschedule(parsedLevel, null, true);
};

export const updateVoca = async (vocaLabel, doneList, status = false) => {
  // 1단계: 로컬 캐시 낙관적 갱신 즉시 수행
  const result = await updateLocalVocaStatus(vocaLabel, doneList, status);
  if (!result) return false;

  const { targetChunk, updatedVocaList } = result;

  // 2단계: 백그라운드 원격 비동기 동기화 (넌블로킹)
  getSession().then((session) => {
    if (session && targetChunk) {
      syncVocaStatusToRemote(
        session.user.id,
        targetChunk.voca_label,
        targetChunk.done,
        targetChunk.status
      ).catch((err) => {
        console.error("[API/Voca] updateVoca 원격 백그라운드 동기화 실패:", err);
      });
    }
  });

  return true;
};
