"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/auth";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user || !isAdmin(user)) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email ?? null);
      setLoading(false);
    };

    check();
  }, [pathname, router, supabase]);

  if (pathname === "/admin/login") {
    return <div className="admin-shell min-h-screen">{children}</div>;
  }

  if (loading) {
    return (
      <div className="admin-shell min-h-screen">
        <div className="container-shell py-16 text-sm text-stone-500">
          Cargando panel...
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="admin-shell min-h-screen">
      <div className="border-b border-stone-200 bg-white">
        <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <Link href="/admin" className="font-serif text-lg text-stone-900">
              Panel Admin
            </Link>
            <p className="text-xs text-stone-500">{email ?? ""}</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm text-stone-700">
            <Link href="/admin/categorias" className="button-ghost">
              Categorias
            </Link>
            <Link href="/admin/productos" className="button-ghost">
              Productos
            </Link>
            <Link href="/admin/apariencia" className="button-ghost">
              Apariencia
            </Link>
            <Link href="/admin/reclamaciones" className="button-ghost">
              Reclamaciones
            </Link>
            <Link href="/admin/legal" className="button-ghost">
              Legal
            </Link>
          </nav>
          <button onClick={handleLogout} className="button-outline">
            Salir
          </button>
        </div>
      </div>
      <main className="container-shell py-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
