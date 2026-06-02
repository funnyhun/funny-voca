import { getSession } from "@/api/auth";
import { updateLocalWordStatus } from "@/api/voca/voca.local";
import { syncWordStatusToRemote } from "@/api/voca/voca.sync";

/**
 * 단어의 학습 완료 상태 변경 (낙관적 로컬 우선 갱신 + 백그라운드 원격 동기화)
 * [이관 안내] voca 도메인에서 master/word 도메인 계층으로 편입되었습니다.
 * 
 * @param {number|string} wordId - 변경 대상 단어 ID
 * @param {boolean} status - 완료 여부 (true/false)
 * @returns {Promise<Object|null>} 갱신 완료된 대상 청크 및 전체 리스트 정보
 */
export const updateWordStatus = async (wordId, status) => {
  // 1단계: 로컬 캐시 낙관적 갱신 즉시 수행
  const result = await updateLocalWordStatus(wordId, status);
  if (!result) return null;

  const { targetChunk, updatedVocaList } = result;

  // 2단계: 백그라운드 원격 비동기 동기화 (넌블로킹)
  getSession().then((session) => {
    if (session && targetChunk) {
      syncWordStatusToRemote(
        session.user.id,
        targetChunk.voca_label,
        targetChunk.done,
        targetChunk.status
      ).catch((err) => {
        console.error("[API/Word] 원격 백그라운드 동기화 실패:", err);
      });
    }
  });

  return updatedVocaList;
};
