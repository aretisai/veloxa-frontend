"use client";

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

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  return item?.image ?? null;
}

export default function CatalogGrid({ recommendations }: { recommendations: Recommendation[] }) {
  function getRecommendation(shoeId: number) {
    return recommendations.find((r) => r.id === shoeId) ?? null;
  }

  const displayCatalog = [...catalog].sort((a, b) => {
    const aRec = getRecommendation(a.id) ? 0 : 1;
    const bRec = getRecommendation(b.id) ? 0 : 1;
    return aRec - bRec;
  });

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
            const displayColor = rec?.recommended_color || shoe.colors_available[0];
            const image = getCoverImage(shoe, displayColor);
            const onSale = shoe.price !== shoe.finalPrice;

            return (
              <div
                key={shoe.id}
                className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow ${
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}