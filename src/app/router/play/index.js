import { redirect } from "react-router-dom";
import { supabase } from "@/common/api/common/supabase";
import { getStorage, KEYS } from "@/common/api/util/storage";

/**
 * 학습(Play) 페이지 진입 시 마지막 학습 위치 또는 기본 위치로 리다이렉트합니다.
 */
export const loadPlay = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  // 1. Member: 일단 기본 0으로 이동 (추후 DB에 마지막 학습 위치 저장 가능)
  if (session) {
    return redirect(`/play/0/card/0`);
  }

  // 2. Guest: Guest Storage 데이터 사용
  const userData = getStorage(KEYS.USER_DATA);
  const wordMaps = getStorage(KEYS.WORD_MAP);
  
  if (!userData || !wordMaps) {
    return { words: [] };
  }

  const currentLevel = userData.level || "default";
  const wordMap = wordMaps[currentLevel] || [];

  let selected = userData.selected || 0;
  if (wordMap.length <= selected) selected = 0;

  return redirect(`/play/${selected}/card/0`);
};
