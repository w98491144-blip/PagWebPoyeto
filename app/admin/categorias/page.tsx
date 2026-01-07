"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminForm from "@/components/AdminForm";
import AdminTable from "@/components/AdminTable";
import ImageUploader from "@/components/ImageUploader";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { slugify } from "@/lib/validators";
import type { Category } from "@/lib/types";

const emptyForm = {
  name: "",
  order: 0,
  is_active: true,
  image_url: null as string | null,
  color_hex: "",
  text_color: ""
};

const getFileName = (url: string | null) => {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1] ?? "";
};

export default function AdminCategoriasPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNextOrder = () => {
    const orders = categories.map((category) => category.order ?? 0);
    return (orders.length ? Math.max(...orders) : 0) + 1;
  };

  const loadCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("order", { ascending: true })
      .order("name", { ascending: true });
    setCategories((data ?? []) as Category[]);
  }, [supabase]);

  useEffect(() => {
    loadCategories();
    setEditingId(null);
    setForm(emptyForm);
  }, [loadCategories]);

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      slug: slugify(form.name),
      image_url: form.image_url || null,
      color_hex: form.color_hex || null,
      text_color: form.text_color || null
    };

    const { error: mutationError } = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase
          .from("categories")
          .insert({ ...payload, order: getNextOrder() });

    if (mutationError) {
      setError(mutationError.message);
      setLoading(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadCategories();
    setLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      order: category.order ?? 0,
      is_active: category.is_active,
      image_url: category.image_url,
      color_hex: category.color_hex ?? "",
      text_color: category.text_color ?? ""
    });
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const confirmed = window.confirm("Eliminar esta categoria?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", editingId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadCategories();
    setLoading(false);
  };

  const moveCategory = async (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
    direction: number
  ) => {
    event.stopPropagation();
    const index = categories.findIndex((category) => category.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= categories.length) {
      return;
    }

    const current = categories[index];
    const target = categories[targetIndex];
    const currentOrder = current.order ?? index + 1;
    const targetOrder = target.order ?? targetIndex + 1;

    const { error: firstError } = await supabase
      .from("categories")
      .update({ order: targetOrder })
      .eq("id", current.id);

    if (firstError) {
      setError(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("categories")
      .update({ order: currentOrder })
      .eq("id", target.id);

    if (secondError) {
      setError(secondError.message);
      return;
    }

    await loadCategories();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wide text-stone-500">
              Catalogo
            </span>
            <h1 className="text-2xl font-semibold text-stone-900">
              Categorias
            </h1>
          </div>
          <button type="button" className="button-outline" onClick={startNew}>
            Nueva categoria
          </button>
        </div>
        <AdminTable columns={["Nombre", "Foto", "Estado", "Orden"]}>
          {categories.map((category, index) => (
            <tr
              key={category.id}
              className="cursor-pointer border-t border-stone-200"
              onClick={() => handleEdit(category)}
            >
              <td className="px-4 py-3">{category.name}</td>
              <td className="px-4 py-3 text-xs text-stone-500">
                {getFileName(category.image_url) || "-"}
              </td>
              <td className="px-4 py-3">
                {category.is_active ? "Activa" : "Inactiva"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">
                    {category.order ?? index + 1}
                  </span>
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={(event) => moveCategory(event, category.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={(event) => moveCategory(event, category.id, 1)}
                  >
                    ↓
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-stone-500" colSpan={4}>
                No hay categorias registradas.
              </td>
            </tr>
          )}
        </AdminTable>
      </div>

      <AdminForm
        title={editingId ? "Editar categoria" : "Nueva categoria"}
        description="Sube foto y define colores."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-stone-600">Nombre</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Activa
            </label>
          </div>
          <div>
            <label className="text-sm text-stone-600">Foto</label>
            <ImageUploader
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-stone-600">Color fondo</label>
              <input
                className="input"
                name="color_hex"
                placeholder="#60933a"
                value={form.color_hex}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Color texto</label>
              <input
                className="input"
                name="text_color"
                placeholder="#f4eadc"
                value={form.text_color}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            {editingId && (
              <button
                type="button"
                className="button-outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar
              </button>
            )}
            {editingId && (
              <button
                type="button"
                className="button-outline border-red-200 text-red-600"
                onClick={handleDelete}
                disabled={loading}
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </AdminForm>
    </div>
  );
}
