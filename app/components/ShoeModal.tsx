"use client";

import { useState, useEffect } from "react";
import type { Shoe, Recommendation, CartItem } from "./CatalogGrid";

const SIZES = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Review {
  rating: number;
  comment: string | null;
  created_at: string | null;
}

function getCoverImage(shoe: Shoe, color: string): string | null {
  const item = shoe.inventory.find((i) => i.color === color);
  return item?.image ?? shoe.inventory[0]?.image ?? null;
}

function Stars({ value, size = "text-base" }: { value: number; size?: string }) {
  return (
    <span className={`${size} text-amber-500 tracking-tight`} aria-label={`${value} out of 5`}>
      {"★".repeat(Math.round(value))}
      <span className="text-line">{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export default function ShoeModal({
  shoe,
  recommendation,
  onAddToCart,
  onClose,
  onAskDetails,
}: {
  shoe: Shoe;
  recommendation: Recommendation | null;
  onAddToCart: (item: CartItem) => void;
  onClose: () => void;
  onAskDetails: (shoe: Shoe) => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const baseColor = recommendation?.recommended_color || shoe.colors_available[0];
  const displayColor = selectedColor || baseColor;
  const detailImage = getCoverImage(shoe, displayColor);

  useEffect(() => {
    setReviewsLoading(true);
    fetch(`${API_URL}/reviews/${shoe.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating ?? null);
      })
      .catch(() => {
        setReviews([]);
        setAvgRating(null);
      })
      .finally(() => setReviewsLoading(false));
  }, [shoe.id]);

  async function handleSubmitReview() {
    if (myRating < 1) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoe_id: shoe.id, rating: myRating, comment: myComment.trim() || null }),
      });
      setSubmitted(true);
      // Re-fetch so the new review appears immediately.
      const res = await fetch(`${API_URL}/reviews/${shoe.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.average_rating ?? null);
    } catch {
      // Silent - a failed review submission should never block the modal.
    } finally {
      setSubmitting(false);
    }
  }

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
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display text-2xl font-bold text-ink">{shoe.model}</h3>
              <button
                onClick={() => onAskDetails(shoe)}
                className="shrink-0 text-xs font-medium text-accent border border-accent rounded-full px-3 py-1.5 hover:bg-accent hover:text-background transition-colors whitespace-nowrap"
              >
                Ask Veloxa
              </button>
            </div>

            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-2">
                <Stars value={avgRating} size="text-sm" />
                <span className="text-xs text-subtle">
                  {avgRating} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

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

        {/* ---------- Reviews ---------- */}
        <div className="border-t border-line px-6 md:px-8 py-6">
          <h4 className="font-display text-lg font-bold text-ink mb-4">Ratings & Reviews</h4>

          {!submitted ? (
            <div className="bg-paper rounded-xl p-4 mb-6">
              <p className="text-sm text-ink mb-3">Own these? Rate them.</p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setMyRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl leading-none transition-colors"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <span className={star <= (hoverRating || myRating) ? "text-amber-500" : "text-line"}>★</span>
                  </button>
                ))}
                {myRating > 0 && <span className="text-xs text-subtle ml-2">{myRating} of 5</span>}
              </div>
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Anything worth mentioning about fit, comfort, or durability? (optional)"
                className="w-full bg-white border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-subtle">{myComment.length}/1000</span>
                <button
                  onClick={handleSubmitReview}
                  disabled={myRating < 1 || submitting}
                  className="bg-ink text-paper rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {submitting ? "Submitting…" : "Submit review"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-emerald-900">Thanks — your review has been recorded.</p>
            </div>
          )}

          {reviewsLoading ? (
            <p className="text-sm text-subtle">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-subtle">No reviews yet. Yours would be the first.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="border-b border-line last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars value={r.rating} size="text-sm" />
                    {r.created_at && (
                      <span className="text-xs text-subtle">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {r.comment && <p className="text-sm text-ink">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
