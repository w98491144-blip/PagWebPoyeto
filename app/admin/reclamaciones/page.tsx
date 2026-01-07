"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminForm from "@/components/AdminForm";
import AdminTable from "@/components/AdminTable";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Reclamacion } from "@/lib/types";

const emptyForm = {
  estado: "RECIBIDO",
  respuesta_proveedor: "",
  fecha_comunicacion_respuesta: "",
  acciones_proveedor: "",
  acciones_fecha: "",
  confirmacion_proveedor: false,
  prorroga_hasta: "",
  prorroga_motivo: "",
  prorroga_fecha_comunicacion: ""
};

type AdminFormState = typeof emptyForm;

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function AdminReclamacionesPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Reclamacion[]>([]);
  const [selected, setSelected] = useState<Reclamacion | null>(null);
  const [form, setForm] = useState<AdminFormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("reclamaciones")
      .select("*")
      .order("fecha_registro", { ascending: false });

    setItems((data ?? []) as Reclamacion[]);
  }, [supabase]);

  useEffect(() => {
    loadItems();
    setSelected(null);
    setForm(emptyForm);
  }, [loadItems]);

  const handleSelect = (item: Reclamacion) => {
    setSelected(item);
    setForm({
      estado: item.estado ?? "RECIBIDO",
      respuesta_proveedor: item.respuesta_proveedor ?? "",
      fecha_comunicacion_respuesta: item.fecha_comunicacion_respuesta ?? "",
      acciones_proveedor: item.acciones_proveedor ?? "",
      acciones_fecha: item.acciones_fecha ?? "",
      confirmacion_proveedor: item.confirmacion_proveedor ?? false,
      prorroga_hasta: item.prorroga_hasta ?? "",
      prorroga_motivo: item.prorroga_motivo ?? "",
      prorroga_fecha_comunicacion: item.prorroga_fecha_comunicacion ?? ""
    });
  };

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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) {
      setError("Selecciona una reclamacion.");
      return;
    }

    setLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const respuesta = form.respuesta_proveedor.trim();
    const acciones = form.acciones_proveedor.trim();

    const payload = {
      estado: form.estado,
      respuesta_proveedor: respuesta || null,
      fecha_respuesta: respuesta ? selected.fecha_respuesta ?? now : null,
      fecha_comunicacion_respuesta: form.fecha_comunicacion_respuesta || null,
      acciones_proveedor: acciones || null,
      acciones_fecha: form.acciones_fecha || null,
      confirmacion_proveedor: form.confirmacion_proveedor,
      confirmacion_proveedor_fecha: form.confirmacion_proveedor
        ? selected.confirmacion_proveedor_fecha ?? now
        : null,
      prorroga_hasta: form.prorroga_hasta || null,
      prorroga_motivo: form.prorroga_motivo || null,
      prorroga_fecha_comunicacion: form.prorroga_fecha_comunicacion || null
    };

    const { error: updateError } = await supabase
      .from("reclamaciones")
      .update(payload)
      .eq("id", selected.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await loadItems();
    setLoading(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wide text-stone-500">
            Libro de reclamaciones
          </span>
          <h1 className="text-2xl font-semibold text-stone-900">Reclamaciones</h1>
        </div>
        <AdminTable columns={["Numero", "Consumidor", "Estado", "Fecha"]}>
          {items.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer border-t border-stone-200"
              onClick={() => handleSelect(item)}
            >
              <td className="px-4 py-3 text-xs text-stone-500">{item.numero_hoja}</td>
              <td className="px-4 py-3">{item.consumidor_nombre_completo}</td>
              <td className="px-4 py-3 text-xs text-stone-500">{item.estado}</td>
              <td className="px-4 py-3 text-xs text-stone-500">
                {formatDate(item.fecha_registro)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-stone-500" colSpan={4}>
                No hay reclamaciones registradas.
              </td>
            </tr>
          )}
        </AdminTable>
      </div>

      <AdminForm
        title={selected ? `Editar ${selected.numero_hoja}` : "Detalle"}
        description="Actualiza estado y respuesta del proveedor."
      >
        {selected ? (
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-2 text-sm text-stone-600">
              <p className="font-semibold text-stone-800">Consumidor</p>
              <p>{selected.consumidor_nombre_completo}</p>
              <p>
                {selected.consumidor_tipo_doc}: {selected.consumidor_num_doc}
              </p>
              <p>{selected.consumidor_email}</p>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p className="font-semibold text-stone-800">Bien o servicio</p>
              <p>{selected.bien_tipo}</p>
              <p>{selected.bien_descripcion}</p>
              <p>Monto: S/ {Number(selected.bien_monto_reclamado).toFixed(2)}</p>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p className="font-semibold text-stone-800">Detalle</p>
              <p>Tipo: {selected.tipo_registro}</p>
              <p>{selected.detalle_reclamacion}</p>
              <p>Pedido: {selected.pedido_consumidor}</p>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p className="font-semibold text-stone-800">Confirmacion consumidor</p>
              <p>{selected.confirmacion_consumidor ? "Confirmado" : "Pendiente"}</p>
              <p>Fecha: {formatDate(selected.confirmacion_consumidor_fecha)}</p>
            </div>
            <div>
              <label className="text-sm text-stone-600">Estado</label>
              <select
                className="input"
                name="estado"
                value={form.estado}
                onChange={handleChange}
              >
                <option value="RECIBIDO">RECIBIDO</option>
                <option value="EN_REVISION">EN_REVISION</option>
                <option value="RESPONDIDO">RESPONDIDO</option>
                <option value="CERRADO">CERRADO</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-stone-600">Respuesta del proveedor</label>
              <textarea
                className="textarea"
                name="respuesta_proveedor"
                rows={4}
                value={form.respuesta_proveedor}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Fecha comunicacion respuesta</label>
              <input
                className="input"
                type="date"
                name="fecha_comunicacion_respuesta"
                value={form.fecha_comunicacion_respuesta}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Acciones adoptadas</label>
              <textarea
                className="textarea"
                name="acciones_proveedor"
                rows={3}
                value={form.acciones_proveedor}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Fecha acciones</label>
              <input
                className="input"
                type="date"
                name="acciones_fecha"
                value={form.acciones_fecha}
                onChange={handleChange}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                name="confirmacion_proveedor"
                checked={form.confirmacion_proveedor}
                onChange={handleChange}
              />
              Confirmacion del proveedor
            </label>
            <div>
              <label className="text-sm text-stone-600">Prorroga hasta</label>
              <input
                className="input"
                type="date"
                name="prorroga_hasta"
                value={form.prorroga_hasta}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Motivo prorroga</label>
              <input
                className="input"
                name="prorroga_motivo"
                value={form.prorroga_motivo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Fecha comunicacion prorroga</label>
              <input
                className="input"
                type="date"
                name="prorroga_fecha_comunicacion"
                value={form.prorroga_fecha_comunicacion}
                onChange={handleChange}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-stone-600">
            Selecciona una reclamacion en la tabla para ver el detalle.
          </p>
        )}
      </AdminForm>
    </div>
  );
}
