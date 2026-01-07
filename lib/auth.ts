import type { User } from "@supabase/supabase-js";

export const isAdmin = (user: User | null | undefined) =>
  user?.app_metadata?.role === "admin";
