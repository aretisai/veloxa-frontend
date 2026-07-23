"use client";

import { useState } from "react";
import type { Shoe, Recommendation, CartItem } from "./CatalogGrid";

const SIZES = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  return item?.image ?? null;
}

export default function ShoeModal({
  shoe,
  recommendation,
  onAddToCart,
  onClose,
}: {
  shoe: Shoe;
  recommendation: Recommendation | null;
  onAddToCart: (item: CartItem) => void;
  onClose: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const baseColor = recommendation?.recommended_color || shoe.colors_available[0];
  const displayColor = selectedColor || baseColor;
  const detailImage = getCoverImage(shoe, displayColor);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-subtle hover:text-ink text-2xl leading-none z-10"
          aria-label="Close"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
          <div className="aspect-square bg-paper rounded-xl flex items-center justify-center overflow-hidden">
            {detailImage ? (
              <img src={`/${detailImage}`} alt={shoe.model} className="w-full h-full object-cover" />
            ) : (
              <span className="text-subtle text-sm">Photo coming soon</span>
            )}
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">{shoe.model}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-ink">${shoe.finalPrice}</span>
              {shoe.price !== shoe.finalPrice && (
                <span className="text-subtle line-through">${shoe.price}</span>
              )}
            </div>

            <p className="text-xs uppercase tracking-wide text-subtle mb-2">Select Color</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {shoe.colors_available.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full border ${
                    color === displayColor
                      ? "bg-ink text-paper border-ink"
                      : "border-line text-ink hover:border-ink"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>

            {recommendation && (
              <div className="bg-paper border-l-4 border-accent rounded-r-lg p-3 mb-4 text-sm">
                <p className="font-semibold text-ink mb-1">
                  ✨ AI Match ({recommendation.match_percentage}%)
                </p>
                <p className="text-subtle">{recommendation.reason}</p>
              </div>
            )}

            <p className="text-xs uppercase tracking-wide text-subtle mb-2">
              Select Size — {displayColor}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {SIZES.map((size) => {
                const item = shoe.inventory.find((i) => i.color === displayColor && i.size === size);
                const stock = item?.stock ?? 0;
                const inStock = stock > 0;
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => inStock && setSelectedSize(size)}
                    disabled={!inStock}
                    className={`text-center rounded-lg border px-2 py-2 transition-colors ${
                      !inStock
                        ? "border-red-100 bg-red-50 cursor-not-allowed opacity-60"
                        : isSelected
                          ? "border-ink bg-ink"
                          : "border-line hover:border-ink"
                    }`}
                  >
                    <div className={`text-sm ${isSelected ? "text-paper" : "text-ink"}`}>{size}</div>
                    <div
                      className={`text-xs font-bold ${
                        !inStock ? "text-red-500" : isSelected ? "text-paper" : "text-emerald-600"
                      }`}
                    >
                      {inStock ? `${stock} in stock` : "Out of Stock"}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (!selectedSize) return;
                onAddToCart({
                  id: crypto.randomUUID(),
                  name: `${shoe.model} — ${displayColor}, ${selectedSize}`,
                  price: shoe.finalPrice,
                });
                onClose();
              }}
              disabled={!selectedSize}
              className="w-full bg-ink text-paper rounded-full py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {selectedSize ? `Add to Cart — $${shoe.finalPrice}` : "Select a size to continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}