// src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// (import.meta as any)로 타입을 우회합니다.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
