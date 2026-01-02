"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

const CategoryHeroGrid = ({ categories }: { categories: Category[] }) => {
  if (categories.length === 0) {
    return (
      <div className="card text-sm text-ink-600">
        No hay categorias activas por ahora.
      </div>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {categories.map((category) => {
        const fallbackColor = category.color_hex ?? "#f2e8d9";

        return (
          <Link
            key={category.id}
            href={`/categorias#${category.slug}`}
            className="group relative overflow-hidden rounded-3xl shadow-soft"
            style={{ backgroundColor: fallbackColor }}
            onClick={() =>
              trackEvent("click_category", {
                category_name: category.name,
                category_slug: category.slug,
                source: "hero_grid"
              })
            }
          >
            {category.image_url ? (
              <div className="relative h-44 w-full md:h-52">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105 group-focus-visible:scale-105"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-44 w-full md:h-52" />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <p className="text-2xl font-semibold text-white drop-shadow-sm">
                {category.name}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
};

export default CategoryHeroGrid;
