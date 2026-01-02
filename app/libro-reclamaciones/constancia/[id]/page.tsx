import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ConstanciaDetail from "@/components/ConstanciaDetail";
import type { Reclamacion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConstanciaPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { token?: string | string[] };
}) {
  const tokenParam = searchParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  if (!token) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_reclamacion_constancia", {
    claim_id: params.id,
    claim_token: token
  });

  if (error || !data || data.length == 0) {
    notFound();
  }

  const claim = (Array.isArray(data) ? data[0] : data) as Reclamacion;
  return <ConstanciaDetail claim={claim} />;
}
