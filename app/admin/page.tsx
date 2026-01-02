"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [stats, setStats] = useState({ categories: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ count: categoriesCount }, { count: productsCount }] =
        await Promise.all([
          supabase
            .from("categories")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
        ]);

      setStats({
        categories: categoriesCount ?? 0,
        products: productsCount ?? 0
      });
      setLoading(false);
    };

    load();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-wide text-stone-500">
          Dashboard
        </span>
        <h1 className="text-2xl font-semibold text-stone-900">Panel admin</h1>
        <p className="text-sm text-stone-600">
          Gestiona categorias, productos y colores del sitio publico.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-stone-500">Categorias</p>
          <p className="text-2xl font-semibold text-stone-900">
            {loading ? "..." : stats.categories}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-500">Productos</p>
          <p className="text-2xl font-semibold text-stone-900">
            {loading ? "..." : stats.products}
          </p>
        </div>
      </div>
    </div>
  );
}
