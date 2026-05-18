import { useState } from 'react';
import { postVoca as gPost, updateVoca as gUpdate } from '../api/guest/voca';
import { postVoca as uPost, updateVoca as uUpdate } from '../api/user/voca';
import { getMaster } from '../api/common/master';
import { getSession } from '../api/auth/session';
import { processWordMap } from '../router/user/utils';
import { supabase } from '../api/common/supabase';
import { removeStorage, KEYS } from '../api/util/storage';

/**
 * 학습 단어 데이터(Voca) 조작 및 상태 관리를 위한 커스텀 훅
 * - 상태(wordMap, wordStatusMap)를 소유합니다.
 * - updateStatus 액션을 호출할 때 즉시 로컬 상태를 변경하고, 비동기 영속성 동기화는 백그라운드에서 실행합니다.
 */
export const useVoca = (initialWordMap = [], initialStatusMap = {}) => {
  const [wordMap, setWordMap] = useState(initialWordMap);
  const [wordStatusMap, setWordStatusMap] = useState(initialStatusMap);

  console.log(wordMap);
  const updateStatus = (wordId, status) => {
    // 1. 즉시 로컬 상태 변경 (낙관적 업데이트)
    setWordStatusMap(prev => {
      const nextStatus = { ...prev, [wordId]: status };
      
      // wordMap도 새 statusMap을 기반으로 실시간 가공하여 갱신
      setWordMap(prevMap => processWordMap(prevMap, nextStatus));
      
      return nextStatus;
    });

    // 2. 비동기 영속성 동기화 (fire-and-forget)
    syncStatus(wordId, status).catch(err => {
      console.error('[useVoca] sync failed:', err);
    });
  };

  const initVoca = async (level) => {
    const session = await getSession();
    if (session) {
      await uPost(session.user.id, level);
    } else {
      await gPost(level);
    }
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

    removeStorage(KEYS.WORD_MAP);
    removeStorage(KEYS.USER_DATA);

    if (session) {
      await uPost(session.user.id, level);
    } else {
      await gPost(level);
    }
  };

  return {
    wordMap,
    wordStatusMap,
    updateStatus,
    initVoca,
    resetVoca,
    getMaster,
  };
};

async function syncStatus(wordId, status) {
  const session = await getSession();
  if (session) {
    await uUpdate(session.user.id, wordId, status);
  } else {
    gUpdate(wordId, status);
  }
}


