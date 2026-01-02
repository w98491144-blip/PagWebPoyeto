"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!isAdmin(data.user)) {
      await supabase.auth.signOut();
      setError("No tienes permisos de administrador.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container-shell flex min-h-screen items-center justify-center">
        <form className="card w-full max-w-md space-y-4" onSubmit={handleSubmit}>
          <div>
            <span className="text-xs uppercase tracking-wide text-stone-500">
              Admin
            </span>
            <h1 className="text-2xl font-semibold text-stone-900">
              Iniciar sesion
            </h1>
            <p className="text-sm text-stone-500">
              Acceso solo para usuarios con rol admin.
            </p>
          </div>
          <div>
            <label className="text-sm text-stone-600">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-600">Contrasena</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
