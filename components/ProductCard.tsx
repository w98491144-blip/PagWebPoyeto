import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getPriceInfo } from "@/lib/pricing";

const ProductCard = ({ product }: { product: Product }) => {
  const price = getPriceInfo(product);

  return (
    <div className="card flex flex-col gap-4">
      {product.image_url ? (
        <div className="relative h-44 w-full">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="rounded-xl object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-xl border border-ink-100 bg-ink-50 text-xs text-ink-400">
          Sin foto
        </div>
      )}
      <div className="flex-1 space-y-2">
        <p className="text-lg font-medium text-ink-900">{product.name}</p>
        {(price.finalLabel || price.baseLabel) && (
          <div className="space-y-1">
            {price.hasDiscount && price.baseLabel && (
              <p className="text-xs text-ink-400 line-through">
                {price.baseLabel}
              </p>
            )}
            {price.finalLabel && (
              <p className="text-sm font-semibold text-ink-600">
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
        <p className="text-sm text-ink-600">
          {product.description || "Descripcion pendiente."}
        </p>
      </div>
      <Link href={`/producto/${product.slug}`} className="button-outline w-full">
        Ver detalle
      </Link>
    </div>
  );
};

export default ProductCard;
