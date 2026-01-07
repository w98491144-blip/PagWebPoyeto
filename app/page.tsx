import Image from "next/image";
import CategoryHeroGrid from "@/components/CategoryHeroGrid";
import { getActiveCategories, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories()
  ]);

  return (
    <div className="space-y-8">
      {settings.hero_image_url && (
        <section className="relative -mx-6 w-[calc(100%+3rem)] md:left-1/2 md:right-1/2 md:-mx-[50vw] md:w-screen">
          <div className="relative w-full overflow-hidden bg-white aspect-[3/1] min-h-[160px] sm:min-h-[200px] md:min-h-0">
            <Image
              src={settings.hero_image_url}
              alt={settings.brand_name ?? "Portada"}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
              unoptimized
            />
          </div>
        </section>
      )}
      <CategoryHeroGrid categories={categories} />
    </div>
  );
}
