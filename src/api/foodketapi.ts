import { supabase } from "../lib/supabase";
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";

// AI 레시피 추천 요청 (FastAPI 경유)
export const getAiRecipe = async (ingredients: string[], userId: string) => {
  const response = await axios.post(`${BACKEND_URL}/api/ai/recommend`, {
    ingredients,
    user_id: userId,
  });
  return response.data;
};

// 거래 게시글 불러오기 (Supabase 직접 조회)
export const fetchTradePosts = async () => {
  const { data, error } = await supabase
    .from("trades")
    .select("*, users(nickname)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// 1:1 채팅 메시지 전송
export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string,
) => {
  const { error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, sender_id: senderId, content });
  if (error) throw error;
};
