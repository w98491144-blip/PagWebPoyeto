"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { getPriceInfo } from "@/lib/pricing";
import { trackEvent, trackMetaEvent } from "@/lib/analytics";

type OrderLinks = {
  rappi?: string | null;
  pedidosya?: string | null;
};

const ProductDetail = ({
  product,
  orderLinks
}: {
  product: Product;
  orderLinks: OrderLinks;
}) => {
  const price = getPriceInfo(product);

  const handleOrderClick = (provider: "rappi" | "pedidosya") => {
    trackMetaEvent("InitiateCheckout", {
      content_name: product.name,
      content_type: "product",
      provider
    });
    trackEvent("click_order", {
      provider,
      source: "product_detail",
      product_name: product.name,
      product_slug: product.slug
    });
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card">
        {product.image_url ? (
          <div className="relative h-80 w-full">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-xl object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center rounded-xl border border-ink-100 bg-ink-50 text-xs text-ink-400">
            Sin foto
          </div>
        )}
      </div>
      <div className="space-y-5">
        <span className="badge">Producto</span>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-ink-900">{product.name}</h1>
          {(price.finalLabel || price.baseLabel) && (
            <div className="space-y-1">
              {price.hasDiscount && price.baseLabel && (
                <p className="text-sm text-ink-400 line-through">
                  {price.baseLabel}
                </p>
              )}
              {price.finalLabel && (
                <p className="text-lg font-semibold text-ink-700">
                  {price.finalLabel}
                </p>
              )}
              {price.discountLabel && (
                <p className="text-xs font-semibold text-ink-500">
                  {price.discountLabel}
                </p>
              )}
            </div>
          )}
        </div>
        <p className="text-sm leading-6 text-ink-700">
          {product.description || "Descripcion pendiente."}
        </p>
        <div className="flex flex-wrap gap-3">
          {orderLinks.rappi ? (
            <a
              href={orderLinks.rappi}
              target="_blank"
              rel="noreferrer"
              className="order-cta order-cta-rappi"
              onClick={() => handleOrderClick("rappi")}
            >
              Rappi
            </a>
          ) : null}
          {orderLinks.pedidosya ? (
            <a
              href={orderLinks.pedidosya}
              target="_blank"
              rel="noreferrer"
              className="order-cta order-cta-pedidosya"
              onClick={() => handleOrderClick("pedidosya")}
            >
              <span className="order-pill-logo" aria-hidden="true">
                P
              </span>
              PedidosYa
            </a>
          ) : null}
          {!orderLinks.rappi && !orderLinks.pedidosya ? (
            <p className="text-sm text-ink-500">
              No hay links de delivery configurados.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
