"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import AnalyticsManager from "@/components/AnalyticsManager";
import RealtimeSync from "@/components/RealtimeSync";
import Footer from "@/components/Footer";
import type { Category, SiteSettings } from "@/lib/types";

const PublicShell = ({
  settings,
  categories,
  children
}: {
  settings: SiteSettings;
  categories: Category[];
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnalyticsManager
        metaPixelId={settings.meta_pixel_id}
        googleTagId={settings.google_tag_id}
      />
      <RealtimeSync />
      <Header settings={settings} categories={categories} />
      <main className="site-main-band">
        <div className="container-shell pb-12 pt-4">{children}</div>
      </main>
      <Footer settings={settings} />
    </>
  );
};

export default PublicShell;
