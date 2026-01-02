import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./supabaseServer";

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
};
