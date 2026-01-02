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
    <div className="space-y-6">
      {settings.hero_image_url && (
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="relative h-72 w-full overflow-hidden bg-white md:h-[24rem]">
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
      <CategoryHeroGrid categories={categories} />
    </div>
  );
}
