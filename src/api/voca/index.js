import { getSession } from "@/api/auth";
import { getProfile as getProfileUser } from "@/api/profile/profile.user";
import { supabase, getProfileCache, setProfileCache, setVocaCache } from "@/api/common";
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
  getRemoteVocaList,
  upsertRemoteVoca,
} from "./voca.sync";

/**
 * 사용자 세션에 맞춰 Voca 단어장 전체 데이터를 조회 및 동기화 병합 후 반환합니다.
 * @returns {Promise<Object>} 레벨별 그룹화된 Voca 객체
 */
export const getVoca = async () => {
  const session = await getSession();

  // 1. 로그인 회원(Member)일 때의 데이터 로딩 및 동적 합집합 병합
  if (session) {
    const userId = session.user.id;
    let vocaData = await getLocalVocaList();
    const remoteVocaListData = await getRemoteVocaList(userId);

    if (remoteVocaListData && remoteVocaListData.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      let hasMergedChanges = false;
      const mergePromises = [];

      Object.keys(vocaData).forEach((level) => {
        const levelChunks = vocaData[level] || [];
        vocaData[level] = levelChunks.map((localChunk) => {
          const remoteChunk = remoteVocaListData.find((rv) => rv.voca_label === localChunk.voca_label);
          if (!remoteChunk) return localChunk;

          // done 배열 합집합 병합 (중복 제거)
          const localDone = Array.isArray(localChunk.done) ? localChunk.done : [];
          const remoteDone = Array.isArray(remoteChunk.done) ? remoteChunk.done : [];
          const mergedDoneSet = new Set([
            ...localDone.map(String),
            ...remoteDone.map(String)
          ]);
          const mergedDone = Array.from(mergedDoneSet).map(Number);

          // status 판별: 완료 개수가 일치하거나 양쪽 중 하나라도 true인 경우
          const isCompleted = mergedDone.length === (localChunk.word?.length || 0) || localChunk.status || remoteChunk.status;
          const completedAt = isCompleted
            ? (localChunk.completed_at || remoteChunk.completed_at || todayStr)
            : null;

          const isLocalChanged = (localChunk.done || []).length !== mergedDone.length || localChunk.status !== isCompleted;
          const isRemoteChanged = (remoteChunk.done || []).length !== mergedDone.length || remoteChunk.status !== isCompleted;

          if (isLocalChanged) {
            hasMergedChanges = true;
          }

          if (isRemoteChanged) {
            mergePromises.push(
              upsertRemoteVoca(userId, {
                voca_label: localChunk.voca_label,
                done: mergedDone,
                status: isCompleted,
                completed_at: completedAt,
                schedule: localChunk.schedule
              })
            );
          }

          return {
            ...localChunk,
            done: mergedDone,
            status: isCompleted,
            completed_at: completedAt
          };
        });
      });

      if (hasMergedChanges) {
        setVocaCache(vocaData);
      }

      if (mergePromises.length > 0) {
        Promise.all(mergePromises).catch((err) => {
          console.error("[Sync] Background bidirectional merge failed:", err);
        });
      }
    }

    // Voca 목록이 전혀 구축되지 않았다면 최초 1회 동적 정렬 배정 및 초기화 구축
    if (!vocaData || Object.keys(vocaData).length === 0) {
      const userProfile = await getProfileUser(userId);
      const currentLevel = userProfile?.level === "default" ? 700 : (parseInt(userProfile?.level) || 700);
      await reschedule(currentLevel, null, false);
      vocaData = await getLocalVocaList();
    }

    return vocaData;
  }

  // 2. 비로그인 게스트(Guest)일 때의 데이터 로딩 및 동적 배정
  let vocaData = await getLocalVocaList();
  if (!vocaData || Object.keys(vocaData).length === 0) {
    const profile = getProfileCache();
    const currentLevel = profile?.level || 700;
    await reschedule(currentLevel, null, false);
    vocaData = await getLocalVocaList();
  }

  return vocaData;
};

/**
 * 스케줄 재배정 및 초기화 (로컬 우선 반영 + 비동기 마이그레이션 및 실시간 진행률 콜백 연동)
 * 
 * @param {number} targetLevel - 대상 레벨
 * @param {Object} [swapCategories=null] - 스왑할 카테고리 정보 { catA, catB }
 * @param {boolean} [isReset=false] - 학습 내역 리셋 여부
 * @param {Function} [onProgress] - 진행율 콜백 함수
 * @returns {Promise<Object|null>} 완료 후 갱신된 Voca 리스트
 */
export const reschedule = async (targetLevel, swapCategories = null, isReset = false, onProgress = null) => {
  try {
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

    const updatedVocaList = await rescheduleLocal(
      targetLevel,
      swapCategories,
      isReset,
      defaultCategoryOrder,
      targetChunks
    );

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
 * 학습 레벨 변경 (로컬 우선 반영 + 비동기 DB 유저 컬럼 동기화)
 * 
 * @param {number} newLevel - 새로 설정할 레벨 (700, 800, 900)
 * @param {Function} [onProgress] - 진행율 콜백
 * @returns {Promise<boolean>} 성공 여부
 */
export const updateLevel = async (newLevel, onProgress = null) => {
  if (!newLevel) return false;

  try {
    setProfileCache({ level: newLevel });

    const success = await reschedule(newLevel, null, false, onProgress);
    if (!success) return false;

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
 * Voca 학습 데이터 전체 초기화 (완전 공장 초기화 정책)
 * 로컬 스토리지를 전면 파지하고, 로그인 사용자는 Supabase 원격 레코드까지 완전 파지합니다.
 * 
 * @returns {Promise<boolean>} 초기화 성공 여부
 */
export const deleteVoca = async () => {
  try {
    deleteLocalVoca();

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

export const updateVoca = async (vocaLabel, doneList, status = false) => {
  const result = await updateLocalVocaStatus(vocaLabel, doneList, status);
  if (!result) return false;

  const { targetChunk } = result;

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
