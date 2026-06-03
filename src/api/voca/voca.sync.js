import { supabase, getProfileCache } from "@/api/common";
import { calculateNewSchedule } from "./voca.local";

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
 * 특정 단어 청크의 학습 성취 현황을 Supabase Voca 테이블에 갱신하고,
 * 완료 미션 달성 시 User 테이블의 completed_date 및 selected 다음 청크 자동 전진 처리를 정밀 수행합니다.
 * 
 * @param {string} userId - 사용자 UUID
 * @param {string} vocaLabel - 청크 식별 라벨
 * @param {Array} doneList - 완료한 단어 ID 목록
 * @param {boolean} status - 청크 완료 여부
 * @returns {Promise<boolean>} 동기화 성공 여부
 */
export const syncWordStatusToRemote = async (userId, vocaLabel, doneList, status = false) => {
  if (!userId || !vocaLabel) return false;

  try {
    // 1. Voca 테이블의 해당 청크 성취 데이터 업데이트
    const { error: updateError } = await supabase
      .from("Voca")
      .update({ done: doneList, status })
      .eq("user_id", userId)
      .eq("voca_label", vocaLabel);

    if (updateError) {
      console.error("[SyncVoca] Voca 성취 업데이트 실패:", updateError.message);
      return false;
    }

    // 2. 만약 Chunk 학습 완료(status = true)가 발생한 경우 비즈니스 흐름 연동
    if (status === true) {
      const todayStr = getTodayString();

      // 2.1 User.completed_date 만료 일자 필드에 오늘 날짜(YYYY-MM-DD) 기록
      const { error: dateError } = await supabase
        .from("User")
        .update({ completed_date: todayStr })
        .eq("user_id", userId);
      if (dateError) console.error("[SyncVoca] completed_date 원격 갱신 오류:", dateError.message);

      // 2.2 User.selected 자동 전진 및 Auto-Skip
      // 최신 전체 Voca 목록을 DB에서 직접 조회하여 schedule 오름차순으로 다음 청크를 식별
      const { data: vocaListData, error: vocaListError } = await supabase
        .from("Voca")
        .select("*")
        .eq("user_id", userId)
        .order("schedule", { ascending: true });

      if (vocaListError) console.error("[SyncVoca] vocaList 로드 오류:", vocaListError.message);
      const vocaList = vocaListData || [];

      const levelStr = vocaLabel.split("-")[0];
      const currentLevelVoca = (vocaList || []).filter((v) => v.voca_label.startsWith(`${levelStr}-`));
      const sortedVoca = [...currentLevelVoca].sort((a, b) => a.schedule - b.schedule);
      
      // 미완료된 첫 번째 청크 탐색
      const nextTodoChunk = sortedVoca.find((v) => v.status === false);

      if (nextTodoChunk) {
        const nextSelectedLabel = nextTodoChunk.voca_label;
        
        // User.selected 컬럼에 다음 미완료 청크 라벨 저장
        const { error: selectUpdateError } = await supabase
          .from("User")
          .update({ selected: nextSelectedLabel })
          .eq("user_id", userId);

        if (selectUpdateError) {
          console.error("[SyncVoca] User.selected 자동 전진 원격 반영 실패:", selectUpdateError.message);
        }
      }
    }

    return true;
  } catch (err) {
    console.error("[SyncVoca] syncWordStatusToRemote 에러:", err);
    return false;
  }
};

/**
 * 카테고리 스왑 및 레벨 마이그레이션(reschedule) 연산을 원격 Supabase DB에 무결성을 보장하며 정합 동기화합니다.
 * 이 메서드는 실시간 진행률 피드백을 위한 onProgress 콜백을 세밀하게 지원합니다.
 * 
 * @param {string} userId - 사용자 UUID
 * @param {number} targetLevel - 대상 레벨
 * @param {Object} [swapCategories=null] - 스왑할 대카테고리 정보 { catA, catB }
 * @param {boolean} [isReset=false] - 대상 레벨의 성취도를 초기화할지 여부
 * @param {Function} [onProgress] - 진행율 콜백 (percentage)
 * @returns {Promise<boolean>} 동기화 성공 여부
 */
export const syncRescheduleToRemote = async (userId, targetLevel, swapCategories = null, isReset = false, onProgress = null) => {
  if (!userId) return false;

  const notifyProgress = (percentage) => {
    if (typeof onProgress === "function") {
      onProgress(percentage);
    }
  };

  try {
    // ----------------------------------------------------
    // 케이스 1: 카테고리 스왑 (reschedule 단독 - 두 대카테고리 맞교환)
    // ----------------------------------------------------
    if (swapCategories) {
      const { catA, catB } = swapCategories;
      notifyProgress(10);

      // 1. 스왑 대상 행들 로드
      const [resultA, resultB] = await Promise.all([
        supabase.from("Voca").select("voca_id, schedule, voca_label").eq("user_id", userId).like("voca_label", `%-${catA}%`),
        supabase.from("Voca").select("voca_id, schedule, voca_label").eq("user_id", userId).like("voca_label", `%-${catB}%`)
      ]);

      const listA = resultA.data || [];
      const listB = resultB.data || [];

      if (listA.length === 0 || listB.length === 0) {
        console.error("[SyncVoca] 스왑 대상 조회 실패 또는 데이터 없음");
        notifyProgress(100);
        return false;
      }
      notifyProgress(30);

      // 두 카테고리의 schedule 범위를 정렬해서 교환
      const schedA = listA.map((v) => v.schedule).sort((x, y) => x - y);
      const schedB = listB.map((v) => v.schedule).sort((x, y) => x - y);

      // 3단계 유니크 충돌 예방 기법 (임시 음수값 치환 우회)
      // 1단계: A 카테고리 행들의 schedule을 임시 음수값으로 치환
      for (let i = 0; i < listA.length; i++) {
        const { error } = await supabase
          .from("Voca")
          .update({ schedule: -(i + 1) })
          .eq("voca_id", listA[i].voca_id);
        if (error) throw error;
      }
      notifyProgress(60);

      // 2단계: B 카테고리 행들의 schedule을 A 카테고리의 양수 schedule로 치환
      const matchLengthB = Math.min(listB.length, schedA.length);
      for (let i = 0; i < matchLengthB; i++) {
        const { error } = await supabase
          .from("Voca")
          .update({ schedule: schedA[i] })
          .eq("voca_id", listB[i].voca_id);
        if (error) throw error;
      }
      notifyProgress(80);

      // 3단계: 임시 음수값으로 치환했던 A 카테고리 행들의 schedule을 B 카테고리의 양수 schedule로 치환
      const matchLengthA = Math.min(listA.length, schedB.length);
      for (let i = 0; i < matchLengthA; i++) {
        const { error } = await supabase
          .from("Voca")
          .update({ schedule: schedB[i] })
          .eq("voca_id", listA[i].voca_id);
        if (error) throw error;
      }

      notifyProgress(100);
      return true;
    }

    // ----------------------------------------------------
    // 케이스 2: 레벨 변경(상향/하향) 및 학습 데이터 초기화
    // ----------------------------------------------------
    notifyProgress(10);
    // 1. 필요한 기초 권장 대카테고리 순서 로드
    const { data: defaultSchedules } = await supabase
      .from("Schedule")
      .select("category_en")
      .order("schedule", { ascending: true });
    
    const defaultCategoryOrder = defaultSchedules ? defaultSchedules.map((s) => s.category_en) : [];
    notifyProgress(25);

    // 2. 신규 레벨에 매핑되는 Chunk 리스트 로드
    const numericLevel = Number(targetLevel) || 700;
    const { data: targetChunks } = await supabase
      .from("Chunk")
      .select("*")
      .lte("level", numericLevel);

    if (!targetChunks || targetChunks.length === 0) {
      console.error("[SyncVoca] 원격 레벨의 Chunk 데이터 로드 실패");
      notifyProgress(100);
      return false;
    }
    notifyProgress(40);

    const { data: oldVocaListData, error: oldVocaError } = await supabase
      .from("Voca")
      .select("*")
      .eq("user_id", userId);

    if (oldVocaError) throw oldVocaError;
    const oldVocaList = oldVocaListData || [];
    notifyProgress(55);

    // 4. 초기화 모드(isReset) 시 기존 성취 데이터 제거한 상태로 세팅
    const filterOldList = isReset ? [] : (oldVocaList || []);

    // 5. 공통 정렬 계산 모듈 구동하여 새로운 1~N schedule 매칭 정보 획득
    const newVocaList = calculateNewSchedule(targetChunks, filterOldList, defaultCategoryOrder);

    // 6. DB 트랜잭션 수동 모방 처리
    // A) 목표 레벨 범위를 벗어나는 기존 행들을 안전하게 DROP
    const validLabels = newVocaList.map((nv) => nv.voca_label);
    const obsoleteLabels = (oldVocaList || [])
      .map((ov) => ov.voca_label)
      .filter((label) => !validLabels.includes(label));

    if (obsoleteLabels.length > 0) {
      const { error: deleteError } = await supabase
        .from("Voca")
        .delete()
        .eq("user_id", userId)
        .in("voca_label", obsoleteLabels);
      if (deleteError) throw deleteError;
    }
    notifyProgress(70);

    // B) 기존에 존재하면서 갱신되어야 할 행들의 schedule을 임시 음수값으로 치환
    const updates = [];
    const inserts = [];

    newVocaList.forEach((nv) => {
      const isExisting = (oldVocaList || []).some((ov) => ov.voca_label === nv.voca_label);
      if (isExisting) {
        updates.push(nv);
      } else {
        inserts.push({
          user_id: userId,
          voca_label: nv.voca_label,
          done: nv.done,
          status: nv.status,
          schedule: nv.schedule,
        });
      }
    });

    // 3단계 유니크 충돌 예방 기법 (임시 음수값 치환 UPDATE)
    for (let i = 0; i < updates.length; i++) {
      const { error } = await supabase
        .from("Voca")
        .update({ schedule: -(i + 100) })
        .eq("user_id", userId)
        .eq("voca_label", updates[i].voca_label);
      if (error) throw error;
    }
    notifyProgress(85);

    // 신규 행 Bulk Insert
    if (inserts.length > 0) {
      const { error: insertError } = await supabase
        .from("Voca")
        .insert(inserts);
      if (insertError) throw insertError;
    }

    // 임시 음수값 행들 최종 양수 정수로 UPDATE 및 데이터 동기화
    for (let i = 0; i < updates.length; i++) {
      const { error } = await supabase
        .from("Voca")
        .update({ 
          schedule: updates[i].schedule,
          done: updates[i].done,
          status: updates[i].status
        })
        .eq("user_id", userId)
        .eq("voca_label", updates[i].voca_label);
      if (error) throw error;
    }

    notifyProgress(100);
    return true;
  } catch (err) {
    console.error("[SyncVoca] syncRescheduleToRemote 에러:", err);
    notifyProgress(100);
    return false;
  }
};

/**
 * Supabase DB 내 해당 사용자의 Voca 학습 진행 레코드를 전면 파지(삭제)하고 관련 프로필 상태 필드를 비웁니다.
 * 
 * @param {string} userId - 사용자 UUID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteRemoteVoca = async (userId) => {
  if (!userId) return false;

  try {
    // 1. Voca 전체 행 삭제
    const { error: vocaDelError } = await supabase
      .from("Voca")
      .delete()
      .eq("user_id", userId);
    
    if (vocaDelError) {
      console.error("[SyncVoca] Voca 테이블 삭제 실패:", vocaDelError.message);
      return false;
    }

    // 2. User 테이블 프로필 진행 상태 필드 초기화
    const { error: userUpdateError } = await supabase
      .from("User")
      .update({
        selected: "",
        completed_date: null
      })
      .eq("user_id", userId);

    if (userUpdateError) {
      console.error("[SyncVoca] User 테이블 필드 초기화 실패:", userUpdateError.message);
    }

    return true;
  } catch (err) {
    console.error("[SyncVoca] deleteRemoteVoca 에러:", err);
    return false;
  }
};

/**
 * 퀴즈 완료 시 특정 청크의 완료 상태(status) 및 completed_at 날짜를 Supabase Voca 테이블에 갱신하고,
 * User 테이블의 completed_date 및 selected 다음 청크 자동 전진 처리를 수행합니다.
 */
export const syncVocaStatusToRemote = async (userId, vocaLabel, doneList = [], status = false) => {
  if (!userId || !vocaLabel) return false;

  try {
    const todayStr = getTodayString();
    const completedAtVal = status ? todayStr : null;

    // 1. Voca 테이블의 completed_at, status, done 업데이트 (원샷 벌크 업데이트)
    const { error: updateError } = await supabase
      .from("Voca")
      .update({ status, completed_at: completedAtVal, done: doneList })
      .eq("user_id", userId)
      .eq("voca_label", vocaLabel);

    if (updateError) {
      console.error("[SyncVoca] Voca completed_at 및 done 업데이트 실패:", updateError.message);
      return false;
    }

    // 2. 만약 청크 완료(status = true)가 발생한 경우 비즈니스 흐름 연동
    if (status === true) {
      // 로컬 프로필 캐시에서 최신 Streak(continued) 값 로드
      const profile = getProfileCache();
      const continuedVal = profile?.continued || 0;

      // 2.1 User.completed_date 및 continued 필드 원격 동기화
      const { error: dateError } = await supabase
        .from("User")
        .update({ completed_date: todayStr, continued: continuedVal })
        .eq("user_id", userId);
      if (dateError) console.error("[SyncVoca] completed_date 및 continued 원격 갱신 오류:", dateError.message);

      const { data: vocaListData, error: vocaListError } = await supabase
        .from("Voca")
        .select("*")
        .eq("user_id", userId)
        .order("schedule", { ascending: true });

      if (vocaListError) console.error("[SyncVoca] vocaList 로드 오류:", vocaListError.message);
      const vocaList = vocaListData || [];

      const levelStr = vocaLabel.split("-")[0];
      const currentLevelVoca = (vocaList || []).filter((v) => v.voca_label.startsWith(`${levelStr}-`));
      const sortedVoca = [...currentLevelVoca].sort((a, b) => a.schedule - b.schedule);
      
      const nextTodoChunk = sortedVoca.find((v) => v.status === false);

      if (nextTodoChunk) {
        const nextSelectedLabel = nextTodoChunk.voca_label;
        
        const { error: selectUpdateError } = await supabase
          .from("User")
          .update({ selected: nextSelectedLabel })
          .eq("user_id", userId);

        if (selectUpdateError) {
          console.error("[SyncVoca] User.selected 자동 전진 원격 반영 실패:", selectUpdateError.message);
        }
      }
    }

    return true;
  } catch (err) {
    console.error("[SyncVoca] syncVocaStatusToRemote 에러:", err);
    return false;
  }
};
