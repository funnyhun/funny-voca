import { supabase } from "@/api/client";
import { getStorage, removeStorage, KEYS } from "@/utils/storage";

/**
 * 로컬스토리지 데이터를 Supabase로 마이그레이션합니다.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>} 성공 여부 객체
 */
export const migrateVoca = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, message: "로그인 세션이 없습니다." };

  const userId = session.user.id;
  const nick = getStorage(KEYS.PROFILE);
  const wordMaps = getStorage(KEYS.VOCA);

  try {
    // 1. User 프로필 생성/업데이트
    if (nick) {
      await supabase.from("User").upsert({
        user_id: userId,
        nick: nick,
      });
    }

    // 2. 학습 진행 데이터(Voca 테이블) 이식
    if (wordMaps && typeof wordMaps === "object") {
      const vocaInserts = [];
      
      Object.keys(wordMaps).forEach((level) => {
        const levelDays = wordMaps[level];
        if (Array.isArray(levelDays)) {
          levelDays.forEach((day) => {
            if (day && Array.isArray(day.word)) {
              day.word.forEach((wordId) => {
                // day.wordStatus 객체가 있고, 해당 단어의 상태가 true인 것만 완료 처리
                const isFinished = day.wordStatus ? (day.wordStatus[wordId] === true) : false;
                vocaInserts.push({
                  user_id: userId,
                  word_id: Number(wordId),
                  day_number: day.day || (Number(day.id) + 1),
                  status: isFinished,
                });
              });
            }
          });
        }
      });

      if (vocaInserts.length > 0) {
        const CHUNK_SIZE = 1000;
        for (let i = 0; i < vocaInserts.length; i += CHUNK_SIZE) {
          const chunk = vocaInserts.slice(i, i + CHUNK_SIZE);
          const { error: vocaError } = await supabase
            .from("Voca")
            .upsert(chunk, { onConflict: "user_id, word_id" });
            
          if (vocaError) throw vocaError;
        }
      }
    }

    // 3. 이전 완료 후 게스트 로컬스토리지 학습 데이터 제거
    removeStorage(KEYS.PROFILE);
    removeStorage(KEYS.VOCA);
    removeStorage(KEYS.USER_DATA);

    return { success: true };

  } catch (error) {
    console.error("[API/User] 마이그레이션 실패:", error.message);
    return { success: false, error: error.message };
  }
};
