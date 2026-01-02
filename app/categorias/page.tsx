import ProductTile from "@/components/ProductTile";
import {
  getActiveCategories,
  getProductsByCategory,
  getSiteSettings
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories()
  ]);
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: await getProductsByCategory(category.id)
    }))
  );
  const visibleCategories = categoriesWithProducts.filter(
    ({ products }) => products.length > 0
  );

  return (
    <div className="space-y-12">
      {visibleCategories.length === 0 ? (
        <div className="card text-sm text-ink-600">
          No hay categorias activas por ahora.
        </div>
      ) : (
        visibleCategories.map(({ category, products }) => (
          <section
            key={category.id}
            id={category.slug}
            className="menu-section scroll-mt-24"
          >
            <div className="menu-section-heading">
              <h2 className="menu-section-title">{category.name}</h2>
            </div>
            <div className="menu-grid">
              {products.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  orderLinks={{
                    rappi:
                      product.rappi_url ||
                      category.rappi_url ||
                      settings.rappi_url,
                    pedidosya:
                      product.pedidosya_url ||
                      category.pedidosya_url ||
                      settings.pedidosya_url
                  }}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
