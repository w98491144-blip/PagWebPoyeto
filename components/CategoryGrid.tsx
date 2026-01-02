"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

const CategoryGrid = ({ categories }: { categories: Category[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categorias#${category.slug}`}
          className="group card transition hover:-translate-y-1"
          onClick={() =>
            trackEvent("click_category", {
              category_name: category.name,
              category_slug: category.slug,
              source: "category_grid"
            })
          }
        >
          <div className="flex items-center gap-4">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-100 bg-ink-50 text-xs text-ink-400">
                Sin foto
              </div>
            )}
            <div>
              <p className="text-lg font-medium text-ink-900">
                {category.name}
              </p>
              <p className="text-sm text-ink-500">Ver productos</p>
            </div>
          </div>
        </Link>
      ))}
      {categories.length === 0 && (
        <div className="card text-sm text-ink-600">
          No hay categorias activas por ahora.
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
