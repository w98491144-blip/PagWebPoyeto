"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BlobProvider } from "@react-pdf/renderer";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { isEmail, isPhone, isRequired } from "@/lib/validators";
import type { Reclamacion, SiteSettings } from "@/lib/types";
import ReclamacionPDF from "@/components/ReclamacionPDF";

const initialForm = {
  consumidor_nombre_completo: "",
  consumidor_domicilio: "",
  consumidor_tipo_doc: "DNI",
  consumidor_num_doc: "",
  consumidor_telefono: "",
  consumidor_email: "",
  consumidor_es_menor: false,
  consumidor_padre_madre: "",
  bien_tipo: "PRODUCTO",
  bien_monto_reclamado: "",
  bien_descripcion: "",
  tipo_registro: "RECLAMO",
  detalle_reclamacion: "",
  pedido_consumidor: "",
  confirmacion_consumidor: false
};

type FormState = typeof initialForm;

type ClaimFormProps = {
  settings: SiteSettings | null;
};

const parseAmount = (value: string) => {
  if (value.trim() == "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const ClaimForm = ({ settings }: ClaimFormProps) => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [constancia, setConstancia] = useState<Reclamacion | null>(null);

  const providerName = settings?.brand_name?.trim() || "Proveedor";
  const providerRuc = "No especificado";
  const providerAddress = "No especificado";
  const providerCode = "No aplica";

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;
    const nextValue =
      type === "checkbox" && event.target instanceof HTMLInputElement
        ? event.target.checked
        : value;
    setForm((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const validate = () => {
    if (!isRequired(form.consumidor_nombre_completo)) return "Ingresa tu nombre completo.";
    if (!isRequired(form.consumidor_domicilio)) return "Ingresa tu domicilio.";
    if (!isRequired(form.consumidor_num_doc)) return "Ingresa tu documento.";
    if (!isRequired(form.consumidor_telefono) && !isRequired(form.consumidor_email)) {
      return "Ingresa telefono o email.";
    }
    if (form.consumidor_email && !isEmail(form.consumidor_email)) {
      return "Ingresa un email valido.";
    }
    if (form.consumidor_telefono && !isPhone(form.consumidor_telefono)) {
      return "Ingresa un telefono valido.";
    }
    if (form.consumidor_es_menor && !isRequired(form.consumidor_padre_madre)) {
      return "Ingresa el nombre del padre/madre o apoderado.";
    }
    if (!isRequired(form.bien_descripcion)) return "Describe el bien o servicio.";
    const amount = parseAmount(form.bien_monto_reclamado);
    if (amount == null || amount < 0) return "Ingresa el monto reclamado.";
    if (!isRequired(form.detalle_reclamacion)) return "Ingresa el detalle del reclamo.";
    if (!isRequired(form.pedido_consumidor)) return "Ingresa el pedido del consumidor.";
    if (!form.confirmacion_consumidor) return "Debes confirmar la informacion.";
    return null;
  };

  const buildPayload = (amount: number) => {
    return {
      proveedor_nombre_razon_social: providerName,
      proveedor_ruc: providerRuc,
      proveedor_domicilio_establecimiento: providerAddress,
      proveedor_codigo_identificacion_establecimiento: providerCode || null,
      consumidor_nombre_completo: form.consumidor_nombre_completo.trim(),
      consumidor_domicilio: form.consumidor_domicilio.trim(),
      consumidor_tipo_doc: form.consumidor_tipo_doc,
      consumidor_num_doc: form.consumidor_num_doc.trim(),
      consumidor_telefono: form.consumidor_telefono.trim(),
      consumidor_email: form.consumidor_email.trim(),
      consumidor_padre_madre: form.consumidor_es_menor
        ? form.consumidor_padre_madre.trim()
        : null,
      consumidor_es_menor: form.consumidor_es_menor,
      bien_tipo: form.bien_tipo,
      bien_monto_reclamado: amount,
      bien_descripcion: form.bien_descripcion.trim(),
      tipo_registro: form.tipo_registro,
      detalle_reclamacion: form.detalle_reclamacion.trim(),
      pedido_consumidor: form.pedido_consumidor.trim(),
      confirmacion_consumidor: form.confirmacion_consumidor,
      confirmacion_consumidor_fecha: form.confirmacion_consumidor
        ? new Date().toISOString()
        : null
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    const amount = parseAmount(form.bien_monto_reclamado);
    if (amount == null) {
      setError("Ingresa el monto reclamado.");
      return;
    }
    const payload = buildPayload(amount);

    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("reclamaciones")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setConstancia(data as Reclamacion);
    setForm(initialForm);
    setLoading(false);
  };

  if (constancia) {
    const token = constancia.public_token ?? "";
    const constanciaUrl = `/libro-reclamaciones/constancia/${constancia.id}?token=${token}`;
    const pdfFileName = `reclamacion-${constancia.numero_hoja}.pdf`;
    return (
      <div className="card space-y-4">
        <span className="badge">Constancia generada</span>
        <h2 className="text-xl font-semibold text-ink-900">
          Reclamo registrado con exito
        </h2>
        <p className="text-sm text-ink-600">
          Numero de hoja: <span className="font-medium">{constancia.numero_hoja}</span>
        </p>
        <div className="grid gap-3 text-sm text-ink-700 md:grid-cols-2">
          <div>
            <p className="font-semibold">Consumidor</p>
            <p>{constancia.consumidor_nombre_completo}</p>
            <p>{constancia.consumidor_tipo_doc}: {constancia.consumidor_num_doc}</p>
            <p>{constancia.consumidor_email || "Sin email"}</p>
          </div>
          <div>
            <p className="font-semibold">Bien/servicio</p>
            <p>{constancia.bien_tipo}</p>
            <p>{constancia.bien_descripcion}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <BlobProvider document={<ReclamacionPDF claim={constancia} />}>
            {({ url, loading: pdfLoading }) => (
              <a
                className="button"
                href={url ?? undefined}
                download={pdfFileName}
                aria-disabled={pdfLoading || !url}
                onClick={(event) => {
                  if (pdfLoading || !url) {
                    event.preventDefault();
                  }
                }}
              >
                {pdfLoading ? "Generando PDF..." : "Descargar PDF"}
              </a>
            )}
          </BlobProvider>
          <Link href={constanciaUrl} className="button-outline">
            Ver constancia
          </Link>
          <button className="button-outline" disabled>
            Enviar constancia (pendiente)
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="card space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">1. Identificacion</p>
          <h2 className="text-lg font-semibold text-ink-900">
            Identificacion del consumidor reclamante
          </h2>
        </div>
        <div>
          <label className="text-sm text-ink-600">Nombre completo</label>
          <input
            className="input"
            name="consumidor_nombre_completo"
            value={form.consumidor_nombre_completo}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="text-sm text-ink-600">Domicilio</label>
          <input
            className="input"
            name="consumidor_domicilio"
            value={form.consumidor_domicilio}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-ink-600">Tipo documento</label>
            <select
              className="input"
              name="consumidor_tipo_doc"
              value={form.consumidor_tipo_doc}
              onChange={handleChange}
            >
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-ink-600">Numero documento</label>
            <input
              className="input"
              name="consumidor_num_doc"
              value={form.consumidor_num_doc}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-ink-600">Telefono</label>
            <input
              className="input"
              name="consumidor_telefono"
              value={form.consumidor_telefono}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm text-ink-600">Email</label>
            <input
              className="input"
              name="consumidor_email"
              value={form.consumidor_email}
              onChange={handleChange}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            name="consumidor_es_menor"
            checked={form.consumidor_es_menor}
            onChange={handleChange}
          />
          Consumidor menor de edad
        </label>
        {form.consumidor_es_menor && (
          <div>
            <label className="text-sm text-ink-600">Padre/madre o apoderado</label>
            <input
              className="input"
              name="consumidor_padre_madre"
              value={form.consumidor_padre_madre}
              onChange={handleChange}
            />
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">2. Bien contratado</p>
          <h2 className="text-lg font-semibold text-ink-900">
            Identificacion del bien contratado
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-ink-600">Tipo de bien</label>
            <select
              className="input"
              name="bien_tipo"
              value={form.bien_tipo}
              onChange={handleChange}
            >
              <option value="PRODUCTO">Producto</option>
              <option value="SERVICIO">Servicio</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-ink-600">Monto reclamado (S/)</label>
            <input
              className="input"
              name="bien_monto_reclamado"
              value={form.bien_monto_reclamado}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-ink-600">Descripcion</label>
          <textarea
            className="textarea"
            name="bien_descripcion"
            rows={3}
            value={form.bien_descripcion}
            onChange={handleChange}
          />
        </div>
      </section>

      <section className="card space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">3. Detalle</p>
          <h2 className="text-lg font-semibold text-ink-900">
            Detalle de la reclamacion y pedido del consumidor
          </h2>
        </div>
        <div>
          <label className="text-sm text-ink-600">Tipo de registro</label>
          <select
            className="input"
            name="tipo_registro"
            value={form.tipo_registro}
            onChange={handleChange}
          >
            <option value="RECLAMO">Reclamo</option>
            <option value="QUEJA">Queja</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-ink-600">Detalle</label>
          <textarea
            className="textarea"
            name="detalle_reclamacion"
            rows={4}
            value={form.detalle_reclamacion}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="text-sm text-ink-600">Pedido del consumidor</label>
          <textarea
            className="textarea"
            name="pedido_consumidor"
            rows={3}
            value={form.pedido_consumidor}
            onChange={handleChange}
          />
        </div>
      </section>

      <section className="card space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">4. Confirmacion</p>
          <h2 className="text-lg font-semibold text-ink-900">Confirmacion</h2>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            name="confirmacion_consumidor"
            checked={form.confirmacion_consumidor}
            onChange={handleChange}
          />
          <span>
            Confirmo que la informacion proporcionada es veraz y autorizo el tratamiento
            de mis datos personales conforme a la politica de privacidad.
          </span>
        </label>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="button"
        disabled={loading || !form.confirmacion_consumidor}
      >
        {loading ? "Enviando..." : "Enviar reclamo"}
      </button>
    </form>
  );
};

export default ClaimForm;
