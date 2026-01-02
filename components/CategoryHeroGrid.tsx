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
      {categories.map((category, index) => {
        const fallbackColor = category.color_hex ?? "#f4eadc";
        const delay = Math.min(index, 6) * 0.08;

        return (
          <Link
            key={category.id}
            href={`/categorias#${category.slug}`}
            className="group category-hero-card min-h-[180px] md:min-h-[210px] animate-fade-up"
            style={{
              backgroundColor: fallbackColor,
              animationDelay: `${delay}s`
            }}
            onClick={() =>
              trackEvent("click_category", {
                category_name: category.name,
                category_slug: category.slug,
                source: "hero_grid"
              })
            }
          >
            {category.image_url && (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="category-hero-card-media"
                unoptimized
              />
            )}
            <div className="category-hero-card-overlay" />
            <div className="category-hero-card-glow" />
            <div className="category-hero-card-content">
              <span className="category-hero-card-kicker">Categoria</span>
              <div className="space-y-2">
                <p className="category-hero-card-title">{category.name}</p>
                <span className="category-hero-card-cta">Ver menu</span>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
};

export default CategoryHeroGrid;
