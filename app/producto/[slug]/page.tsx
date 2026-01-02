import { notFound } from "next/navigation";
import TrackView from "@/components/TrackView";
import ProductDetail from "@/components/ProductDetail";
import {
  getCategoryById,
  getProductBySlug,
  getSiteSettings
} from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  return {
    title: product ? `${product.name} | Producto` : "Producto"
  };
}

export default async function ProductoPage({
  params
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product || !product.is_active) {
    notFound();
  }

  const [settings, category] = await Promise.all([
    getSiteSettings(),
    product.category_id
      ? getCategoryById(product.category_id)
      : Promise.resolve(null)
  ]);

  const orderLinks = {
    rappi: product.rappi_url || category?.rappi_url || settings.rappi_url,
    pedidosya: product.pedidosya_url || category?.pedidosya_url || settings.pedidosya_url
  };

  return (
    <div className="space-y-10">
      <TrackView
        event="view_product"
        params={{
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          category_id: product.category_id
        }}
        metaEvent="ViewContent"
        metaParams={{
          content_name: product.name,
          content_type: "product"
        }}
      />
      <ProductDetail product={product} orderLinks={orderLinks} />
    </div>
  );
}
