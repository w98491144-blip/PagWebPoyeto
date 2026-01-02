import type { Product } from "./types";

type PriceInfo = {
  baseLabel: string | null;
  finalLabel: string | null;
  discountLabel: string | null;
  hasDiscount: boolean;
};

const parseNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (value: number) => `S/ ${value.toFixed(2)}`;

const formatDiscount = (value: number) => {
  const rounded = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  return `-${rounded}%`;
};

export const getPriceInfo = (product: Product): PriceInfo => {
  const amount = parseNumber(product.price_amount);
  const discount = parseNumber(product.discount_percent) ?? 0;
  const hasDiscount = amount !== null && discount > 0;

  if (amount === null && product.price_display) {
    return {
      baseLabel: product.price_display,
      finalLabel: product.price_display,
      discountLabel: null,
      hasDiscount: false
    };
  }

  if (amount === null) {
    return {
      baseLabel: null,
      finalLabel: null,
      discountLabel: null,
      hasDiscount: false
    };
  }

  const finalAmount = amount * (1 - Math.min(discount, 100) / 100);
  const baseLabel = product.price_display ?? formatPrice(amount);

  return {
    baseLabel,
    finalLabel: formatPrice(finalAmount),
    discountLabel: hasDiscount ? formatDiscount(discount) : null,
    hasDiscount
  };
};
