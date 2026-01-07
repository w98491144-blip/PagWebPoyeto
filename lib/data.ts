import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "./supabaseServer";
import type { Category, LegalPage, Product, SiteSettings } from "./types";

export const defaultSettings: SiteSettings = {
  id: "default",
  brand_name: "Restaurante",
  hero_title: "Cocina honesta, sabor diario",
  hero_subtitle: "Un menu breve, ingredientes frescos y pedidos por delivery.",
  meta_pixel_id: null,
  google_tag_id: null,
  rappi_url: null,
  pedidosya_url: null,
  facebook_url: null,
  instagram_url: null,
  tiktok_url: null,
  whatsapp_url: null,
  contact_email: null,
  logo_url: null,
  favicon_url: null,
  footer_logo_url: null,
  libro_reclamaciones_logo_url: null,
  hero_image_url: null,
  top_bar_text: "Encuentranos en Rappi y PedidosYa",
  top_bar_bg: "#60933a",
  top_bar_text_color: "#f4eadc",
  header_bg: "#d82739",
  header_text_color: "#f4eadc",
  page_bg: "#f4eadc",
  accent_color: "#60933a",
  accent_text_color: "#f4eadc",
  pill_bg: "#f4eadc",
  pill_text_color: "#2f2417",
  pill_active_bg: "#60933a",
  pill_active_text_color: "#f4eadc",
  footer_bg: "#d82739",
  footer_text_color: "#f4eadc",
  updated_at: null
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { ...defaultSettings };
  }

  const merged = { ...defaultSettings, ...data } as SiteSettings;
  return merged;
};

export const getActiveCategories = async (): Promise<Category[]> => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("order", { ascending: true })
    .order("name", { ascending: true });

  return (data ?? []) as Category[];
};

export const getActiveProducts = async (
  limit?: number
): Promise<Product[]> => {
  noStore();
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("order", { ascending: true });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data } = await query;

  return (data ?? []) as Product[];
};

export const getCategoryBySlug = async (slug: string) => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data as Category | null;
};

export const getCategoryById = async (id: string) => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data as Category | null;
};

export const getProductsByCategory = async (categoryId: string) => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("order", { ascending: true });

  return (data ?? []) as Product[];
};

export const getProductBySlug = async (slug: string) => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data as Product | null;
};

export const getLegalPageBySlug = async (slug: string) => {
  noStore();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("legal_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data as LegalPage | null;
};
