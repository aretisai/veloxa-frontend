"use client";

import { useState } from "react";
import catalogData from "@/data/veloxa_enhanced_catalog.json";

interface InventoryItem {
  color: string;
  size: string;
  stock: number;
  image: string;
}

interface Shoe {
  id: number;
  model: string;
  category: string;
  price: number;
  finalPrice: number;
  colors_available: string[];
  inventory: InventoryItem[];
}

export interface Recommendation {
  id: number;
  match_percentage: number;
  reason: string;
  recommended_color?: string;
}

const catalog = catalogData.catalog as Shoe[];
const SIZES = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  return item?.image ?? null;
}

export default function CatalogGrid({ recommendations }: { recommendations: Recommendation[] }) {
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  function getRecommendation(shoeId: number) {
    return recommendations.find((r) => r.id === shoeId) ?? null;
  }

  function openShoe(shoe: Shoe) {
    setSelectedShoe(shoe);
    setSelectedColor(null);
  }

  function closeShoe() {
    setSelectedShoe(null);
    setSelectedColor(null);
  }

  const displayCatalog = [...catalog].sort((a, b) => {
    const aRec = getRecommendation(a.id) ? 0 : 1;
    const bRec = getRecommendation(b.id) ? 0 : 1;
    return aRec - bRec;
  });

  const selectedRec = selectedShoe ? getRecommendation(selectedShoe.id) : null;
  const baseColor = selectedRec?.recommended_color || selectedShoe?.colors_available[0] || "";
  const displayColor = selectedColor || baseColor;
  const detailImage = selectedShoe ? getCoverImage(selectedShoe, displayColor) : null;

  return (
    <section className="bg-paper py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">
          Full Collection
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-10">
          Shop the Lineup
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayCatalog.map((shoe) => {
            const rec = getRecommendation(shoe.id);
            const cardColor = rec?.recommended_color || shoe.colors_available[0];
            const image = getCoverImage(shoe, cardColor);
            const onSale = shoe.price !== shoe.finalPrice;

            return (
              <button
                key={shoe.id}
                onClick={() => openShoe(shoe)}
                className={`text-left bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow ${
                  rec ? "border-accent border-2" : "border-line"
                }`}
              >
                <div className="aspect-square bg-paper flex items-center justify-center">
                  {image ? (
                    <img src={`/${image}`} alt={shoe.model} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-subtle text-sm">Photo coming soon</span>
                  )}
                </div>
                <div className="p-4">
                  {rec && (
                    <span className="inline-block bg-accent text-background text-xs font-bold px-2 py-1 rounded-full mb-2">
                      {rec.match_percentage}% Match
                    </span>
                  )}
                  <p className="text-xs uppercase tracking-wide text-subtle mb-1">{shoe.category}</p>
                  <h3 className="font-semibold text-ink mb-1">{shoe.model}</h3>
                  {rec && <p className="text-xs text-subtle italic mb-2">✨ {rec.reason}</p>}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">${shoe.finalPrice}</span>
                    {onSale && <span className="text-sm text-subtle line-through">${shoe.price}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedShoe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeShoe} />

          <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={closeShoe}
              className="absolute top-4 right-4 text-subtle hover:text-ink text-2xl leading-none z-10"
              aria-label="Close"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
              <div className="aspect-square bg-paper rounded-xl flex items-center justify-center overflow-hidden">
                {detailImage ? (
                  <img src={`/${detailImage}`} alt={selectedShoe.model} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-subtle text-sm">Photo coming soon</span>
                )}
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold text-ink mb-2">{selectedShoe.model}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-ink">${selectedShoe.finalPrice}</span>
                  {selectedShoe.price !== selectedShoe.finalPrice && (
                    <span className="text-subtle line-through">${selectedShoe.price}</span>
                  )}
                </div>

                <p className="text-xs uppercase tracking-wide text-subtle mb-2">Select Color</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedShoe.colors_available.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
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

                {selectedRec && (
                  <div className="bg-paper border-l-4 border-accent rounded-r-lg p-3 mb-4 text-sm">
                    <p className="font-semibold text-ink mb-1">
                      ✨ AI Match ({selectedRec.match_percentage}%)
                    </p>
                    <p className="text-subtle">{selectedRec.reason}</p>
                  </div>
                )}

                <p className="text-xs uppercase tracking-wide text-subtle mb-2">
                  Live Stock — {displayColor}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SIZES.map((size) => {
                    const item = selectedShoe.inventory.find(
                      (i) => i.color === displayColor && i.size === size
                    );
                    const stock = item?.stock ?? 0;
                    return (
                      <div
                        key={size}
                        className={`text-center rounded-lg border px-2 py-2 ${
                          stock > 0 ? "border-line" : "border-red-100 bg-red-50"
                        }`}
                      >
                        <div className="text-sm text-ink">{size}</div>
                        <div
                          className={`text-xs font-bold ${
                            stock > 0 ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {stock > 0 ? `${stock} in stock` : "Out of Stock"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}