import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/api/profile';
import { getSession } from '@/api/auth';

/**
 * 사용자 프로필(닉네임 등) 조작 및 상태 관리를 위한 커스텀 훅
 * - 상태(nick)를 소유합니다.
 * - updateNick 액션을 호출할 때 즉시 로컬 상태를 변경하고, 비동기 영속성 동기화는 백그라운드에서 실행합니다.
 */
export const useProfile = (initialNick = '') => {
  const [nick, setNick] = useState(initialNick);

  // 로더 데이터 갱신에 따른 닉네임 상태 동기화 추가
  useEffect(() => {
    setNick(initialNick);
  }, [initialNick]);

  const updateNick = (newNick) => {
    // 1. 즉시 로컬 상태 갱신 (낙관적 업데이트)
    setNick(newNick);

    // 2. 백그라운드 영속성 동기화 (fire-and-forget)
    syncProfile(newNick).catch(err => {
      console.error('[useProfile] sync failed:', err);
    });
  };

  return {
    nick,
    updateNick,
  };
};

async function syncProfile(newNick) {
  await updateProfile({ nick: newNick });
}

