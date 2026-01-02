"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminForm from "@/components/AdminForm";
import AdminTable from "@/components/AdminTable";
import ImageUploader from "@/components/ImageUploader";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { slugify } from "@/lib/validators";
import type { Category, Product } from "@/lib/types";

const emptyForm = {
  name: "",
  category_id: "",
  description: "",
  price_amount: "",
  discount_percent: "",
  price_display: "",
  order: 0,
  is_active: true,
  image_url: null as string | null,
  rappi_url: "",
  pedidosya_url: ""
};

type ProductForm = typeof emptyForm;

type NumberValue = number | string | null | undefined;

const parseNumber = (value: string) => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumberField = (value: NumberValue) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const formatPrice = (value: number) => `S/ ${value.toFixed(2)}`;

const buildPriceLabel = (product: Product) => {
  const amount = parseNumber(formatNumberField(product.price_amount));
  const discount = parseNumber(formatNumberField(product.discount_percent)) ?? 0;
  const baseLabel =
    product.price_display || (amount !== null ? formatPrice(amount) : "");

  if (!baseLabel) return "-";
  if (amount === null || discount <= 0) return baseLabel;

  const finalAmount = amount * (1 - Math.min(discount, 100) / 100);
  const discountLabel = Number.isInteger(discount)
    ? `-${discount}%`
    : `-${discount.toFixed(1)}%`;

  return `${baseLabel} -> ${formatPrice(finalAmount)} (${discountLabel})`;
};

export default function AdminProductosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNextOrder = () => {
    const orders = products.map((product) => product.order ?? 0);
    return (orders.length ? Math.max(...orders) : 0) + 1;
  };

  const loadData = useCallback(async () => {
    const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true })
        .order("name", { ascending: true })
    ]);

    setProducts((productsData ?? []) as Product[]);
    setCategories((categoriesData ?? []) as Category[]);
  }, [supabase]);

  useEffect(() => {
    loadData();
    setEditingId(null);
    setForm(emptyForm);
  }, [loadData]);

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const priceAmount = parseNumber(form.price_amount);
    const discountValue = parseNumber(form.discount_percent);
    const normalizedDiscount =
      discountValue === null
        ? null
        : Math.max(0, Math.min(discountValue, 100));

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      category_id: form.category_id || null,
      description: form.description || null,
      price_amount: priceAmount,
      discount_percent: normalizedDiscount,
      price_display: form.price_display || null,
      order: form.order,
      is_active: form.is_active,
      image_url: form.image_url || null,
      rappi_url: form.rappi_url || null,
      pedidosya_url: form.pedidosya_url || null
    };

    const { error: mutationError } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase
          .from("products")
          .insert({ ...payload, order: getNextOrder() });

    if (mutationError) {
      setError(mutationError.message);
      setLoading(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadData();
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category_id: product.category_id ?? "",
      description: product.description ?? "",
      price_amount: formatNumberField(product.price_amount),
      discount_percent: formatNumberField(product.discount_percent),
      price_display: product.price_display ?? "",
      order: product.order ?? 0,
      is_active: product.is_active,
      image_url: product.image_url,
      rappi_url: product.rappi_url ?? "",
      pedidosya_url: product.pedidosya_url ?? ""
    });
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const confirmed = window.confirm("Eliminar este producto?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", editingId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadData();
    setLoading(false);
  };

  const moveProduct = async (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
    direction: number
  ) => {
    event.stopPropagation();
    const index = products.findIndex((product) => product.id === id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= products.length) {
      return;
    }

    const current = products[index];
    const target = products[targetIndex];
    const currentOrder = current.order ?? index + 1;
    const targetOrder = target.order ?? targetIndex + 1;

    const { error: firstError } = await supabase
      .from("products")
      .update({ order: targetOrder })
      .eq("id", current.id);

    if (firstError) {
      setError(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("products")
      .update({ order: currentOrder })
      .eq("id", target.id);

    if (secondError) {
      setError(secondError.message);
      return;
    }

    await loadData();
  };

  const categoryById = new Map(
    categories.map((category) => [category.id, category])
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wide text-stone-500">
              Catalogo
            </span>
            <h1 className="text-2xl font-semibold text-stone-900">Productos</h1>
          </div>
          <button type="button" className="button-outline" onClick={startNew}>
            Nuevo producto
          </button>
        </div>
        <AdminTable
          columns={["Nombre", "Categoria", "Precio", "Estado", "Orden"]}
        >
          {products.map((product, index) => (
            <tr
              key={product.id}
              className="cursor-pointer border-t border-stone-200"
              onClick={() => handleEdit(product)}
            >
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3 text-xs text-stone-500">
                {categoryById.get(product.category_id ?? "")?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-xs text-stone-500">
                {buildPriceLabel(product)}
              </td>
              <td className="px-4 py-3">
                {product.is_active ? "Activo" : "Inactivo"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">
                    {product.order ?? index + 1}
                  </span>
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={(event) => moveProduct(event, product.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={(event) => moveProduct(event, product.id, 1)}
                  >
                    ↓
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-stone-500" colSpan={5}>
                No hay productos registrados.
              </td>
            </tr>
          )}
        </AdminTable>
      </div>

      <AdminForm
        title={editingId ? "Editar producto" : "Nuevo producto"}
        description="Completa la ficha con precio y descuento."
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
          <div>
            <label className="text-sm text-stone-600">Categoria</label>
            <select
              className="input"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
            >
              <option value="">Sin categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-stone-600">Descripcion</label>
            <textarea
              className="textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-stone-600">Precio</label>
              <input
                className="input"
                name="price_amount"
                type="number"
                step="0.01"
                value={form.price_amount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">Descuento %</label>
              <input
                className="input"
                name="discount_percent"
                type="number"
                step="0.1"
                value={form.discount_percent}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-stone-600">Texto precio (opcional)</label>
            <input
              className="input"
              name="price_display"
              value={form.price_display}
              onChange={handleChange}
              placeholder="S/ 25.00"
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
              Activo
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
              <label className="text-sm text-stone-600">Rappi URL</label>
              <input
                className="input"
                name="rappi_url"
                value={form.rappi_url}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm text-stone-600">PedidosYa URL</label>
              <input
                className="input"
                name="pedidosya_url"
                value={form.pedidosya_url}
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
