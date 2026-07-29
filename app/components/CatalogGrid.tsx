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

const COLOR_SWATCH: Record<string, string> = {
  Black: "#1a1a1a", White: "#f5f5f5", Red: "#dc2626", Blue: "#2563eb",
  Green: "#16a34a", Orange: "#ea580c", Pink: "#ec4899", Grey: "#9ca3af",
  Brown: "#92653c", Yellow: "#eab308",
};

const INITIAL_DISPLAY_COUNT = 20;

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  // Fall back to any real photo for this shoe rather than showing none - a
  // mismatched color name shouldn't mean "no photo" when we know one exists.
  return item?.image ?? shoe.inventory[0]?.image ?? null;
}

function getBaseModelName(fullName: string): string {
  return fullName.replace(/\s+Series\s+\S+$/i, "").trim();
}

type SortOption = "featured" | "price-low" | "price-high";

export default function CatalogGrid({
  recommendations,
  category,
  onSelectShoe,
}: {
  recommendations: Recommendation[];
  category: string;
  onSelectShoe: (shoeId: number) => void;
}) {
  const [sort, setSort] = useState<SortOption>("featured");
  const [showAll, setShowAll] = useState(false);

  function getRecommendation(shoeId: number) {
    return recommendations.find((r) => r.id === shoeId) ?? null;
  }

  const displayCatalog = useMemo(() => {
    let result = catalog.filter((shoe) => category === "All" || shoe.category === category);

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
  }, [category, sort, recommendations]);

  // Matched shoes always show, in their already-sorted order - never subject to
  // the diversity grouping below. Only the *remaining* slots get filled by
  // round-robin across model lines, skipping any line a match already covered.
  const visibleCatalog = useMemo(() => {
    if (showAll) return displayCatalog;

    const matched = displayCatalog.filter((shoe) => getRecommendation(shoe.id));
    const unmatched = displayCatalog.filter((shoe) => !getRecommendation(shoe.id));

    const remainingSlots = INITIAL_DISPLAY_COUNT - matched.length;
    if (remainingSlots <= 0) return matched;

    const matchedBaseNames = new Set(matched.map((s) => getBaseModelName(s.model)));
    const groups = new Map<string, Shoe[]>();
    for (const shoe of unmatched) {
      const base = getBaseModelName(shoe.model);
      if (matchedBaseNames.has(base)) continue;
      if (!groups.has(base)) groups.set(base, []);
      groups.get(base)!.push(shoe);
    }
    const groupArrays = Array.from(groups.values());

    const filler: Shoe[] = [];
    let row = 0;
    while (filler.length < remainingSlots) {
      let addedAny = false;
      for (const group of groupArrays) {
        if (row < group.length) {
          filler.push(group[row]);
          addedAny = true;
          if (filler.length >= remainingSlots) break;
        }
      }
      if (!addedAny) break;
      row++;
    }

    return [...matched, ...filler];
  }, [displayCatalog, showAll, recommendations]);

  return (
    <section className="bg-paper py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-subtle">
            Showing {visibleCatalog.length} of {displayCatalog.length}
            {category !== "All" ? ` in ${category}` : ""}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm text-ink bg-white border border-line rounded-lg px-3 py-2 focus:outline-none focus:border-ink"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {visibleCatalog.length === 0 ? (
          <p className="text-subtle text-sm py-12 text-center">No shoes in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {visibleCatalog.map((shoe) => {
              const rec = getRecommendation(shoe.id);
              const cardColor = rec?.recommended_color || shoe.colors_available[0];
              const image = getCoverImage(shoe, cardColor);
              const onSale = shoe.price !== shoe.finalPrice;

              return (
                <button key={shoe.id} onClick={() => onSelectShoe(shoe.id)} className="text-left group">
                  <div className="relative aspect-square bg-[#F1F0EA] flex items-center justify-center mb-3 overflow-hidden">
                    {onSale && (
                      <span className="absolute top-2 left-2 z-10 bg-white text-accent text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded">
                        Sale
                      </span>
                    )}
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

        {!showAll && displayCatalog.length > INITIAL_DISPLAY_COUNT && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(true)}
              className="border border-ink text-ink text-sm font-medium px-8 py-3 rounded-full hover:bg-ink hover:text-paper transition-colors"
            >
              View all {displayCatalog.length}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}