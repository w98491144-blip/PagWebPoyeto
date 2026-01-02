import { notFound, redirect } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  return {
    title: category ? `${category.name} | Categoria` : "Categoria"
  };
}

export default async function CategoriaPage({
  params
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);

  if (!category || !category.is_active) {
    notFound();
  }
  redirect(`/categorias#${category.slug}`);
}
