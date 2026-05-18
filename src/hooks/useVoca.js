import { postVoca as gPost, getVoca as gGet, updateVoca as gUpdate } from '../api/guest/voca';
import { postVoca as uPost, getVoca as uGet, updateVoca as uUpdate } from '../api/user/voca';
import { getMaster } from '../api/common/master';
import { getSession } from '../api/auth/session';

/**
 * 학습 단어 데이터(Voca) 조작을 위한 커스텀 훅
 * - 세션 상태를 동적으로 확인하여 Guest(LocalStorage)와 User(Supabase) API로 안전하게 라우팅합니다.
 */
export const useVoca = () => {
  const postVoca = async (level) => {
    const session = await getSession();
    if (session) {
      return await uPost(session.user.id, level);
    }
    return await gPost(level);
  };

  const getVoca = async (level) => {
    const session = await getSession();
    if (session) {
      return await uGet(session.user.id, level);
    }
    return gGet(level);
  };

  const updateVoca = async (wordId, status) => {
    const session = await getSession();
    if (session) {
      return await uUpdate(session.user.id, wordId, status);
    }
    return gUpdate(wordId, status);
  };

  return {
    postVoca,
    getVoca,
    updateVoca,
    getMaster,
  };
};
