import { useState, useEffect } from 'react';
import { postVoca, updateVoca } from '@/api/voca';
import { getMaster } from '@/api/word';
import { getSession } from '@/api/auth';
import { processWordMap } from '@/app/router/user/utils';
import { supabase } from '@/api/client';
import { removeStorage, KEYS } from '@/utils/storage';

/**
 * 학습 단어 데이터(Voca) 조작 및 상태 관리를 위한 커스텀 훅
 * - 상태(wordMap, wordStatusMap)를 소유합니다.
 * - updateStatus 액션을 호출할 때 즉시 로컬 상태를 변경하고, 비동기 영속성 동기화는 백그라운드에서 실행합니다.
 */
export const useVoca = (initialVoca = [], initialStatusMap = {}) => {
  const [voca, setVoca] = useState(initialVoca);
  const [wordStatusMap, setWordStatusMap] = useState(initialStatusMap);

  // 로더 데이터 갱신에 따른 리액트 상태 동기화 보완
  useEffect(() => {
    setVoca(initialVoca);
    setWordStatusMap(initialStatusMap);
  }, [JSON.stringify(initialVoca), JSON.stringify(initialStatusMap)]);

  const updateStatus = (wordId, status) => {
    // 1. 즉시 로컬 상태 변경 (낙관적 업데이트)
    setWordStatusMap(prev => {
      const nextStatus = { ...prev, [wordId]: status };
      
      // voca도 새 statusMap을 기반으로 실시간 가공하여 갱신
      setVoca(prevMap => processWordMap(prevMap, nextStatus));
      
      return nextStatus;
    });

    // 2. 비동기 영속성 동기화 (fire-and-forget)
    syncStatus(wordId, status).catch(err => {
      console.error('[useVoca] sync failed:', err);
    });
  };

  const initVoca = async (level) => {
    await postVoca(level);
  };

  const resetVoca = async (level) => {
    const session = await getSession();
    if (session) {
      const { error } = await supabase
        .from("Voca")
        .delete()
        .eq("user_id", session.user.id);
      if (error) throw error;
    }

    removeStorage(KEYS.VOCA);
    removeStorage(KEYS.USER_DATA);

    const result = await postVoca(level);

    if (!result) {
      throw new Error("학습 데이터를 재배정하는 중 오류가 발생했습니다.");
    }
  };

  return {
    voca,
    wordStatusMap,
    updateStatus,
    initVoca,
    resetVoca,
    getMaster,
  };
};

async function syncStatus(wordId, status) {
  await updateVoca(wordId, status);
}


