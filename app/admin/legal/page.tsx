"use client";

export default function AdminLegalPage() {
  return (
    <div className="card space-y-3 text-sm text-stone-600">
      <p className="text-base font-semibold text-stone-900">Politicas fijas</p>
      <p>
        La politica de privacidad y los terminos ahora son parte del esqueleto
        del sitio y no se editan desde el panel.
      </p>
      <p>
        Para actualizar los datos visibles, edita el nombre del sitio y el
        correo en <span className="font-semibold">Apariencia</span>.
      </p>
    </div>
  );
}
