import { useState } from 'react';
import { updateStats as gUpdate } from '@/common/api/guest/stats';
import { getSession } from '@/common/api/auth/session';
import { getStorage, KEYS } from '@/common/api/util/storage';

/**
 * 학습 통계 및 사용자 메타데이터 관리를 위한 커스텀 훅
 * - 상태(userData)를 소유합니다.
 * - recordSession 액션을 호출하면 즉시 로컬 통계를 업데이트하고 UI 상태를 동기화합니다.
 */
export const useStats = (initialUserData = {}) => {
  const [userData, setUserData] = useState(initialUserData);

  const recordSession = () => {
    // 1. 게스트 로컬스토리지 기반 통계 업데이트 처리
    gUpdate();

    // 2. 업데이트된 로컬스토리지를 기준으로 즉시 UI 상태 갱신
    const updatedUserData = getStorage(KEYS.USER_DATA);
    if (updatedUserData) {
      setUserData(prev => ({
        ...prev,
        ...updatedUserData,
      }));
    }

    // 3. 비동기 영속성 동기화 (User 모드 확장용, fire-and-forget)
    syncStats().catch(err => {
      console.error('[useStats] sync failed:', err);
    });
  };

  return {
    userData,
    recordSession,
  };
};

async function syncStats() {
  const session = await getSession();
  if (session) {
    // 향후 회원용 통계 DB 업데이트 API 구현 시 연동
  }
}

