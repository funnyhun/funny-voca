import { updateStats as gUpdate } from '../api/guest/stats';
import { getSession } from '../api/auth/session';

/**
 * 학습 통계(연속 학습일, 오늘 학습량) 업데이트를 위한 커스텀 훅
 * - 현재는 게스트 로컬스토리지 처리를 공통으로 수행하며 세션 여부에 따라 추가 동작 가능합니다.
 */
export const useStats = () => {
  const updateStats = async () => {
    const session = await getSession();
    if (session) {
      // User 모드 전용 통계 업데이트 로직이 필요한 경우 여기에 작성
      // 현재는 로컬스토리지 학습 데이터 기반으로 구동되므로 gUpdate() 수행
      gUpdate();
    } else {
      gUpdate();
    }
  };

  return {
    updateStats,
  };
};
