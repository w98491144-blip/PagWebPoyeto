import type { CSSProperties, ReactNode } from "react";
import { Libre_Baskerville, Work_Sans } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/PublicShell";
import { getActiveCategories, getSiteSettings } from "@/lib/data";
import type { Metadata } from "next";

const headingFont = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading"
});

const bodyFont = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body"
});

export const dynamic = "force-dynamic";

type CSSVars = {
  [key in `--${string}`]?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.brand_name ?? "Micrositio Restaurante";
  const description =
    settings.hero_subtitle ?? "Catalogo y legal del restaurante";
  const iconUrl = settings.favicon_url ?? settings.logo_url ?? undefined;

  return {
    title,
    description,
    icons: iconUrl ? { icon: iconUrl } : undefined
  };
}

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories()
  ]);
  const themeStyle: CSSProperties & CSSVars = {
    "--page-bg": settings.page_bg ?? "#fee8d2",
    "--header-bg": settings.header_bg ?? "#0c5447",
    "--header-text": settings.header_text_color ?? "#fee8d2",
    "--topbar-bg": settings.top_bar_bg ?? "#3b2a1a",
    "--topbar-text": settings.top_bar_text_color ?? "#ffffff",
    "--accent": settings.accent_color ?? "#ee7721",
    "--accent-text": settings.accent_text_color ?? "#ffffff",
    "--pill-bg": settings.pill_bg ?? "#fee8d2",
    "--pill-text": settings.pill_text_color ?? "#0c5447",
    "--pill-active-bg": settings.pill_active_bg ?? "#ee7721",
    "--pill-active-text": settings.pill_active_text_color ?? "#ffffff",
    "--footer-bg": settings.footer_bg ?? "#ee7721",
    "--footer-text": settings.footer_text_color ?? "#ffffff"
  };

  return (
    <html lang="es">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} font-sans`}
        style={themeStyle}
      >
        <PublicShell settings={settings} categories={categories}>
          {children}
        </PublicShell>
      </body>
    </html>
  );
}
