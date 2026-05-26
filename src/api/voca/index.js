import { getSession } from "@/api/auth";
import {
  postVoca as postVocaGuest,
  getVoca as getVocaGuest,
  updateVoca as updateVocaGuest,
} from "./voca.guest";
import {
  postVoca as postVocaUser,
  getVoca as getVocaUser,
  updateVoca as updateVocaUser,
} from "./voca.user";

/**
 * 단어 학습 데이터를 초기화합니다.
 * 세션 판별은 내부에서 처리하므로 호출자는 게스트/유저를 구분할 필요가 없습니다.
 * @param {string} level - 선택된 레벨
 * @returns {Promise<Object|null>}
 */
export const postVoca = async (level) => {
  const session = await getSession();
  return session ? postVocaUser(session.user.id, level) : postVocaGuest(level);
};

/**
 * 단어 학습 데이터를 조회합니다.
 * @param {string} [level] - 조회할 레벨
 * @returns {Promise<Array>|Array}
 */
export const getVoca = async (level) => {
  const session = await getSession();
  return session ? getVocaUser(session.user.id, level) : getVocaGuest(level);
};

/**
 * 특정 단어의 학습 상태를 업데이트합니다.
 * @param {number} wordId - 단어 ID
 * @param {boolean} status - 학습 완료 여부
 * @returns {Promise<boolean>|boolean}
 */
export const updateVoca = async (wordId, status = true) => {
  const session = await getSession();
  return session
    ? updateVocaUser(session.user.id, wordId, status)
    : updateVocaGuest(wordId, status);
};
