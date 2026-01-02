"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { getPriceInfo } from "@/lib/pricing";
import { trackEvent, trackMetaEvent } from "@/lib/analytics";

type OrderLinks = {
  rappi?: string | null;
  pedidosya?: string | null;
};

const ProductTile = ({
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
      source: "product_tile",
      product_name: product.name,
      product_slug: product.slug
    });
  };

  return (
    <div className="menu-item">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          width={112}
          height={112}
          className="menu-item-media"
          unoptimized
        />
      ) : (
        <div className="menu-item-placeholder">Sin foto</div>
      )}
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="menu-item-title">{product.name}</h3>
          {(price.finalLabel || price.baseLabel) && (
            <div className="text-right">
              {price.hasDiscount && price.baseLabel && (
                <p className="text-xs text-ink-400 line-through">
                  {price.baseLabel}
                </p>
              )}
              {price.finalLabel && (
                <p className="menu-item-price">{price.finalLabel}</p>
              )}
              {price.discountLabel && (
                <p className="text-xs font-semibold text-ink-500">
                  {price.discountLabel}
                </p>
              )}
            </div>
          )}
        </div>
        <p className="menu-item-desc">
          {product.description || "Descripcion pendiente."}
        </p>
        <div className="flex flex-wrap gap-2">
          {orderLinks.rappi && (
            <a
              href={orderLinks.rappi}
              target="_blank"
              rel="noreferrer"
              className="order-pill order-pill-rappi"
              onClick={() => handleOrderClick("rappi")}
            >
              Rappi
            </a>
          )}
          {orderLinks.pedidosya && (
            <a
              href={orderLinks.pedidosya}
              target="_blank"
              rel="noreferrer"
              className="order-pill order-pill-pedidosya"
              onClick={() => handleOrderClick("pedidosya")}
            >
              <span className="order-pill-logo" aria-hidden="true">
                P
              </span>
              PedidosYa
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTile;
