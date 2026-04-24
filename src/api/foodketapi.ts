import { supabase } from "../lib/supabase";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

// --- AI 관련 ---
export const getAiRecipe = async (ingredients: string[], userId: string) => {
  const { data } = await axios.post(`${API_BASE}/ai/recommend`, {
    ingredients,
    user_id: userId,
  });
  return data;
};

// --- 거래 게시판 관련 ---
export const getTradePosts = async () => {
  const { data, error } = await supabase
    .from("trades")
    .select(`*, users(nickname, avatar_url)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const createTradePost = async (postData: any) => {
  const { data, error } = await supabase.from("trades").insert(postData);
  if (error) throw error;
  return data;
};

// --- 커뮤니티 댓글 관련 ---
export const getComments = async (postId: number) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId);
  if (error) throw error;
  return data;
};
