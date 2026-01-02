import Image from "next/image";
import CategoryHeroGrid from "@/components/CategoryHeroGrid";
import { getActiveCategories, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories()
  ]);
  const heroTitle = settings.hero_title ?? "Nuestra carta";
  const heroSubtitle = settings.hero_subtitle ?? null;

  return (
    <div className="space-y-8">
      {settings.hero_image_url && (
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="relative w-full overflow-hidden bg-white aspect-[3/1]">
            <Image
              src={settings.hero_image_url}
              alt={settings.brand_name ?? "Portada"}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </section>
      )}
      <section className="space-y-3 text-center animate-fade-up md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-500">
          Carta digital
        </p>
        <h1 className="font-serif text-4xl text-ink-900 md:text-5xl">
          {heroTitle}
        </h1>
        {heroSubtitle && (
          <p className="max-w-2xl text-base text-ink-600 md:text-lg">
            {heroSubtitle}
          </p>
        )}
      </section>
      <CategoryHeroGrid categories={categories} />
    </div>
  );
}
