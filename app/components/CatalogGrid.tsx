"use client";

import { useState, useMemo } from "react";
import catalogData from "@/data/veloxa_enhanced_catalog.json";

export interface InventoryItem {
  color: string;
  size: string;
  stock: number;
  image: string;
}

export interface Shoe {
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

export interface CartItem {
  id: string;
  name: string;
  price: number;
}

export const catalog = catalogData.catalog as Shoe[];
const CATEGORIES = ["All", "Lifestyle", "Road Running", "Track & Field", "Trail Running"];

const COLOR_SWATCH: Record<string, string> = {
  Black: "#1a1a1a", White: "#f5f5f5", Red: "#dc2626", Blue: "#2563eb",
  Green: "#16a34a", Orange: "#ea580c", Pink: "#ec4899", Grey: "#9ca3af",
  Brown: "#92653c", Yellow: "#eab308",
};

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  return item?.image ?? null;
}

type SortOption = "featured" | "price-low" | "price-high";

export default function CatalogGrid({
  recommendations,
  category,
  onCategoryChange,
  onSelectShoe,
}: {
  recommendations: Recommendation[];
  category: string;
  onCategoryChange: (cat: string) => void;
  onSelectShoe: (shoeId: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");

  function getRecommendation(shoeId: number) {
    return recommendations.find((r) => r.id === shoeId) ?? null;
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

  return (
    <section className="bg-paper py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs text-subtle mb-4">
          Home <span className="mx-1">›</span> Shop
          {category !== "All" && (
            <>
              <span className="mx-1">›</span>
              <span className="text-ink">{category}</span>
            </>
          )}
        </p>
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">Full Collection</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-8">Shop the Lineup</h2>

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
                    onClick={() => onCategoryChange(cat)}
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
                    <button key={shoe.id} onClick={() => onSelectShoe(shoe.id)} className="text-left group">
                      <div className="aspect-square bg-white flex items-center justify-center mb-3 overflow-hidden">
                        {image ? (
                          <img src={`/${image}`} alt={shoe.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                          <span key={c} className="w-3 h-3 rounded-full border border-line" style={{ backgroundColor: COLOR_SWATCH[c] ?? "#ccc" }} />
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
    </section>
  );
}