import ClaimForm from "@/components/ClaimForm";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LibroReclamacionesPage() {
  const settings = await getSiteSettings();
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink-900">
          Libro de Reclamaciones
        </h1>
        <p className="text-sm text-ink-600">
          Completa el formulario oficial para registrar tu reclamo o queja.
        </p>
      </div>
      <ClaimForm settings={settings} />
    </section>
  );
}
