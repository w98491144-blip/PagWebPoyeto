"use client";

import Link from "next/link";
import { BlobProvider } from "@react-pdf/renderer";
import type { Reclamacion } from "@/lib/types";
import ReclamacionPDF from "@/components/ReclamacionPDF";

const ConstanciaDetail = ({ claim }: { claim: Reclamacion }) => {
  return (
    <div className="space-y-6">
      <div>
        <span className="badge">Constancia</span>
        <h1 className="font-serif text-3xl text-ink-900">
          Hoja de Reclamacion
        </h1>
        <p className="text-sm text-ink-600">
          Numero de hoja: <span className="font-medium">{claim.numero_hoja}</span>
        </p>
      </div>

      <div className="card space-y-3 text-sm text-ink-700">
        <div>
          <p className="font-semibold">Proveedor</p>
          <p>{claim.proveedor_nombre_razon_social}</p>
          <p>RUC: {claim.proveedor_ruc}</p>
          <p>{claim.proveedor_domicilio_establecimiento}</p>
        </div>
        <div>
          <p className="font-semibold">Consumidor</p>
          <p>{claim.consumidor_nombre_completo}</p>
          <p>{claim.consumidor_tipo_doc}: {claim.consumidor_num_doc}</p>
          <p>{claim.consumidor_email || "Sin email"}</p>
        </div>
        <div>
          <p className="font-semibold">Bien/servicio</p>
          <p>{claim.bien_tipo}</p>
          <p>{claim.bien_descripcion}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <BlobProvider document={<ReclamacionPDF claim={claim} />}>
          {({ url, loading }) => (
            <a
              className="button"
              href={url ?? undefined}
              download={`reclamacion-${claim.numero_hoja}.pdf`}
              aria-disabled={loading || !url}
              onClick={(event) => {
                if (loading || !url) {
                  event.preventDefault();
                }
              }}
            >
              {loading ? "Generando PDF..." : "Descargar PDF"}
            </a>
          )}
        </BlobProvider>
        <Link href="/libro-reclamaciones" className="button-outline">
          Registrar otro reclamo
        </Link>
      </div>
    </div>
  );
};

export default ConstanciaDetail;
