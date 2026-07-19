"use client";

import { useState, useMemo } from "react";
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
const CATEGORIES = ["All", "Lifestyle", "Road Running", "Track & Field", "Trail Running"];

const COLOR_SWATCH: Record<string, string> = {
  Black: "#1a1a1a",
  White: "#f5f5f5",
  Red: "#dc2626",
  Blue: "#2563eb",
  Green: "#16a34a",
  Orange: "#ea580c",
  Pink: "#ec4899",
  Grey: "#9ca3af",
  Brown: "#92653c",
  Yellow: "#eab308",
};

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  return item?.image ?? null;
}

type SortOption = "featured" | "price-low" | "price-high";

export default function CatalogGrid({ recommendations }: { recommendations: Recommendation[] }) {
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("featured");

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

  const displayCatalog = useMemo(() => {
    let result = catalog.filter((shoe) => {
      const matchesSearch = shoe.model.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || shoe.category === category;
      return matchesSearch && matchesCategory;
    });

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sort === "price-high") {
      result = [...result].sort((a, b) => b.finalPrice - a.finalPrice);
    } else {
      result = [...result].sort((a, b) => {
        const aRec = getRecommendation(a.id) ? 0 : 1;
        const bRec = getRecommendation(b.id) ? 0 : 1;
        return aRec - bRec;
      });
    }
    return result;
  }, [search, category, sort, recommendations]);

  const selectedRec = selectedShoe ? getRecommendation(selectedShoe.id) : null;
  const baseColor = selectedRec?.recommended_color || selectedShoe?.colors_available[0] || "";
  const displayColor = selectedColor || baseColor;
  const detailImage = selectedShoe ? getCoverImage(selectedShoe, displayColor) : null;

  return (
    <section className="bg-paper py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">
          Full Collection
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-8">
          Shop the Lineup
        </h2>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the collection..."
          className="w-full text-3xl md:text-4xl font-display text-ink placeholder:text-line bg-transparent border-b border-line pb-4 mb-10 focus:outline-none focus:border-ink transition-colors"
        />

        <div className="flex flex-col md:flex-row gap-10">
          <aside className="md:w-48 shrink-0">
            <div className="mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-subtle mb-3">Sort</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full text-sm text-ink bg-white border border-line rounded-lg px-3 py-2 focus:outline-none focus:border-ink"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-subtle mb-3">Category</p>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      category === cat ? "bg-ink text-paper" : "text-ink hover:bg-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {displayCatalog.length === 0 ? (
              <p className="text-subtle text-sm py-12 text-center">No shoes match your search.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {displayCatalog.map((shoe) => {
                  const rec = getRecommendation(shoe.id);
                  const cardColor = rec?.recommended_color || shoe.colors_available[0];
                  const image = getCoverImage(shoe, cardColor);
                  const onSale = shoe.price !== shoe.finalPrice;

                  return (
                    <button key={shoe.id} onClick={() => openShoe(shoe)} className="text-left group">
                      <div className="aspect-square bg-white flex items-center justify-center mb-3 overflow-hidden">
                        {image ? (
                          <img
                            src={`/${image}`}
                            alt={shoe.model}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-subtle text-sm">Photo coming soon</span>
                        )}
                      </div>
                      {rec && (
                        <span className="inline-block bg-accent text-background text-xs font-bold px-2 py-1 rounded-full mb-2">
                          {rec.match_percentage}% Match
                        </span>
                      )}
                      <h3 className="font-semibold text-ink">{shoe.model}</h3>
                      <div className="flex items-center gap-1.5 mt-1 mb-2">
                        {shoe.colors_available.map((c) => (
                          <span
                            key={c}
                            className="w-3 h-3 rounded-full border border-line"
                            style={{ backgroundColor: COLOR_SWATCH[c] ?? "#ccc" }}
                          />
                        ))}
                      </div>
                      {rec && <p className="text-xs text-subtle italic mb-1">✨ {rec.reason}</p>}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">${shoe.finalPrice}</span>
                        {onSale && <span className="text-sm text-subtle line-through">${shoe.price}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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