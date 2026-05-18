import { getProfile as gGet, updateProfile as gUpdate } from '../api/guest/profile';
import { getProfile as uGet, updateProfile as uUpdate } from '../api/user/profile';
import { getSession } from '../api/auth/session';

/**
 * 사용자 프로필(닉네임 등) 조작을 위한 커스텀 훅
 * - 세션 상태를 동적으로 확인하여 Guest(LocalStorage)와 User(Supabase) API로 안전하게 라우팅합니다.
 */
export const useProfile = () => {
  const getProfile = async () => {
    const session = await getSession();
    if (session) {
      return await uGet(session.user.id);
    }
    return gGet();
  };

  const updateProfile = async (data) => {
    const session = await getSession();
    if (session) {
      return await uUpdate(session.user.id, data);
    }
    return gUpdate(data);
  };

  return {
    getProfile,
    updateProfile,
  };
};
