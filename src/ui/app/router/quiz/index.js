import { redirect } from "react-router-dom";
import { supabase } from "@/common/api/common/supabase";
import { getStorage, KEYS } from "@/common/api/util/storage";

/**
 * 퀴즈(Quiz) 페이지 진입 시 마지막 학습 위치 또는 기본 위치로 리다이렉트합니다.
 */
export const loadQuiz = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  // 1. Member
  if (session) {
    return redirect(`/quiz/0`); // 추후 DB 정보 연동 가능
  }

  // 2. Guest
  const userData = getStorage(KEYS.USER_DATA);
  const wordMaps = getStorage(KEYS.WORD_MAP);
  
  if (!userData || !wordMaps) {
    return { words: [] };
  }

  const currentLevel = userData.level || "default";
  const wordMap = wordMaps[currentLevel] || [];

  let selected = userData.selected || 0;
  if (wordMap.length <= selected) selected = 0;

  return redirect(`/quiz/${selected}`);
};
