"use client";

import { useEffect, useMemo, useState } from "react";
import AdminForm from "@/components/AdminForm";
import ImageUploader from "@/components/ImageUploader";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { SiteSettings } from "@/lib/types";

const accentDefault = "#d82739";

const defaultForm: SiteSettings = {
  id: "",
  brand_name: "",
  hero_title: "",
  hero_subtitle: "",
  hero_image_url: "",
  meta_pixel_id: "",
  google_tag_id: "",
  rappi_url: "",
  pedidosya_url: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  whatsapp_url: "",
  contact_email: "",
  logo_url: "",
  favicon_url: "",
  footer_logo_url: "",
  libro_reclamaciones_logo_url: "",
  top_bar_text: "",
  top_bar_bg: "#d82739",
  top_bar_text_color: "#f4eadc",
  header_bg: "#60933a",
  header_text_color: "#f4eadc",
  page_bg: "#f4eadc",
  accent_color: accentDefault,
  accent_text_color: "#f4eadc",
  pill_bg: "#f4eadc",
  pill_text_color: "#60933a",
  pill_active_bg: accentDefault,
  pill_active_text_color: "#f4eadc",
  footer_bg: "#d82739",
  footer_text_color: "#f4eadc",
  updated_at: null
};

type PaletteForm = {
  top_bg: string;
  middle_bg: string;
  bottom_bg: string;
};

const defaultPalette: PaletteForm = {
  top_bg: defaultForm.header_bg ?? "",
  middle_bg: defaultForm.page_bg ?? "",
  bottom_bg: defaultForm.footer_bg ?? ""
};

const normalizeHex = (value: string, fallback: string) => {
  const raw = value.trim();
  if (!raw) return fallback;
  const cleaned = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : fallback;
};

const getTextColor = (hex: string) => {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? "#2f2417" : "#f4eadc";
};

export default function AdminAparienciaPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [form, setForm] = useState<SiteSettings>(defaultForm);
  const [palette, setPalette] = useState<PaletteForm>(defaultPalette);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setForm({ ...defaultForm, ...data });
        setPalette({
          top_bg: data.header_bg ?? data.top_bar_bg ?? defaultForm.header_bg,
          middle_bg: data.page_bg ?? defaultForm.page_bg,
          bottom_bg: data.footer_bg ?? defaultForm.footer_bg
        });
      } else {
        setForm({ ...defaultForm });
        setPalette(defaultPalette);
      }
    };

    load();
  }, [supabase]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaletteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPalette((prev) => ({ ...prev, [name]: value }));
  };

  const persistImageField = async (
    field:
      | "hero_image_url"
      | "logo_url"
      | "favicon_url"
      | "footer_logo_url"
      | "libro_reclamaciones_logo_url",
    value: string | null
  ) => {
    setError(null);

    if (form.id) {
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ [field]: value })
        .eq("id", form.id);

      if (updateError) {
        setError(updateError.message);
      }

      return;
    }

    const { data, error: insertError } = await supabase
      .from("site_settings")
      .insert({ [field]: value })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data?.id) {
      setForm((prev) => ({ ...prev, id: data.id }));
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const topBarBg = "#d82739";
    const topBarText = "#f4eadc";
    const topBg = normalizeHex(palette.top_bg, defaultForm.header_bg ?? "#60933a");
    const middleBg = normalizeHex(palette.middle_bg, defaultForm.page_bg ?? "#f4eadc");
    const bottomBg = normalizeHex(palette.bottom_bg, defaultForm.footer_bg ?? "#d82739");
    const topText = getTextColor(topBg);
    const bottomText = getTextColor(bottomBg);
    const accentText = getTextColor(accentDefault);

    const payload = {
      brand_name: form.brand_name || null,
      hero_title: form.hero_title || null,
      hero_subtitle: form.hero_subtitle || null,
      hero_image_url: form.hero_image_url || null,
      meta_pixel_id: form.meta_pixel_id || null,
      google_tag_id: form.google_tag_id || null,
      rappi_url: form.rappi_url || null,
      pedidosya_url: form.pedidosya_url || null,
      facebook_url: form.facebook_url || null,
      instagram_url: form.instagram_url || null,
      tiktok_url: form.tiktok_url || null,
      whatsapp_url: form.whatsapp_url || null,
      contact_email: form.contact_email || null,
      logo_url: form.logo_url || null,
      favicon_url: form.favicon_url || null,
      footer_logo_url: form.footer_logo_url || null,
      libro_reclamaciones_logo_url: form.libro_reclamaciones_logo_url || null,
      top_bar_text: form.top_bar_text || null,
      top_bar_bg: topBarBg,
      top_bar_text_color: topBarText,
      header_bg: topBg,
      header_text_color: topText,
      page_bg: middleBg,
      accent_color: accentDefault,
      accent_text_color: accentText,
      pill_bg: middleBg,
      pill_text_color: getTextColor(middleBg),
      pill_active_bg: accentDefault,
      pill_active_text_color: accentText,
      footer_bg: bottomBg,
      footer_text_color: bottomText
    };

    if (form.id) {
      const { error: mutationError } = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", form.id);

      if (mutationError) {
        setError(mutationError.message);
        setLoading(false);
        return;
      }
    } else {
      const { data, error: mutationError } = await supabase
        .from("site_settings")
        .insert(payload)
        .select("*")
        .single();

      if (mutationError) {
        setError(mutationError.message);
        setLoading(false);
        return;
      }

      if (data) {
        setForm({ ...defaultForm, ...data });
        setPalette({
          top_bg: data.header_bg ?? data.top_bar_bg ?? defaultForm.header_bg,
          middle_bg: data.page_bg ?? defaultForm.page_bg,
          bottom_bg: data.footer_bg ?? defaultForm.footer_bg
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wide text-stone-500">
          Apariencia
        </span>
        <h1 className="text-2xl font-semibold text-stone-900">
          Colores y branding
        </h1>
        <p className="text-sm text-stone-600">
          Ajusta logos, portada y colores principales.
        </p>
      </div>

      <AdminForm title="Branding" description="Logos, portada y links.">
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="text-sm text-stone-600">Nombre de marca</label>
            <input
              className="input"
              name="brand_name"
              value={form.brand_name ?? ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm text-stone-600">Imagen portada</label>
            <ImageUploader
              value={form.hero_image_url}
              optimize={false}
              onChange={(url) => {
                setForm((prev) => ({ ...prev, hero_image_url: url }));
                void persistImageField("hero_image_url", url);
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-stone-600">Logo principal</label>
              <ImageUploader
                value={form.logo_url}
                onChange={(url) => {
                  setForm((prev) => ({ ...prev, logo_url: url }));
                  void persistImageField("logo_url", url);
                }}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Logo navegador</label>
              <ImageUploader
                value={form.favicon_url}
                onChange={(url) => {
                  setForm((prev) => ({ ...prev, favicon_url: url }));
                  void persistImageField("favicon_url", url);
                }}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Logo footer</label>
              <ImageUploader
                value={form.footer_logo_url}
                onChange={(url) => {
                  setForm((prev) => ({ ...prev, footer_logo_url: url }));
                  void persistImageField("footer_logo_url", url);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-stone-600">
              Logo libro de reclamaciones
            </label>
            <ImageUploader
              value={form.libro_reclamaciones_logo_url}
              onChange={(url) => {
                setForm((prev) => ({
                  ...prev,
                  libro_reclamaciones_logo_url: url
                }));
                void persistImageField("libro_reclamaciones_logo_url", url);
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-stone-600">Rappi URL</label>
              <input
                className="input"
                name="rappi_url"
                value={form.rappi_url ?? ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">PedidosYa URL</label>
              <input
                className="input"
                name="pedidosya_url"
                value={form.pedidosya_url ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-stone-600">Instagram</label>
              <input
                className="input"
                name="instagram_url"
                value={form.instagram_url ?? ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Facebook</label>
              <input
                className="input"
                name="facebook_url"
                value={form.facebook_url ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-stone-600">TikTok</label>
              <input
                className="input"
                name="tiktok_url"
                value={form.tiktok_url ?? ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">WhatsApp</label>
              <input
                className="input"
                name="whatsapp_url"
                value={form.whatsapp_url ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-stone-600">Email de contacto</label>
            <input
              className="input"
              name="contact_email"
              value={form.contact_email ?? ""}
              onChange={handleChange}
              placeholder="contacto@dominio.com"
            />
          </div>
          <div>
            <label className="text-sm text-stone-600">Texto barra superior</label>
            <input
              className="input"
              name="top_bar_text"
              value={form.top_bar_text ?? ""}
              onChange={handleChange}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </AdminForm>

      <AdminForm
        title="Marketing"
        description="IDs para Pixel y Google (GA4 o GTM)."
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="text-sm text-stone-600">Meta Pixel ID</label>
            <input
              className="input"
              name="meta_pixel_id"
              value={form.meta_pixel_id ?? ""}
              onChange={handleChange}
              placeholder="1234567890"
            />
          </div>
          <div>
            <label className="text-sm text-stone-600">Google Tag ID</label>
            <input
              className="input"
              name="google_tag_id"
              value={form.google_tag_id ?? ""}
              onChange={handleChange}
              placeholder="G-XXXXXXX o GTM-XXXX"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar marketing"}
          </button>
        </form>
      </AdminForm>

      <AdminForm
        title="Paleta simple"
        description="Solo arriba, medio y abajo. El resto se ajusta solo."
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-stone-600">Color arriba</label>
              <input
                className="input"
                name="top_bg"
                value={palette.top_bg}
                onChange={handlePaletteChange}
                placeholder="#60933a"
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Color medio</label>
              <input
                className="input"
                name="middle_bg"
                value={palette.middle_bg}
                onChange={handlePaletteChange}
                placeholder="#f4eadc"
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Color abajo</label>
              <input
                className="input"
                name="bottom_bg"
                value={palette.bottom_bg}
                onChange={handlePaletteChange}
                placeholder="#d82739"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar paleta"}
          </button>
        </form>
      </AdminForm>
    </div>
  );
}
