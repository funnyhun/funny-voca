import { supabase } from "./common";

/**
 * Supabase Notification 테이블에서 모든 알림 정보를 생성일 역순으로 조회합니다.
 * @returns {Promise<Array>} 알림 레코드 배열
 */
export const getNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from("Notification")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[API/Notification] getNotifications Error:", err);
    return [];
  }
};
