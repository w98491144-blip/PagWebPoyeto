import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card space-y-3 text-center">
      <h1 className="font-serif text-2xl text-ink-900">
        Pagina no encontrada
      </h1>
      <p className="text-sm text-ink-600">
        La pagina que buscas no existe o fue movida.
      </p>
      <Link href="/" className="button-outline">
        Volver al inicio
      </Link>
    </div>
  );
}
