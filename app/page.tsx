"use client";

import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import CatalogGrid, { catalog, type Recommendation, type CartItem, type Shoe } from "./components/CatalogGrid";
import ShoeModal from "./components/ShoeModal";
import ConciergePanel from "./components/ConciergePanel";

const MARQUEE_ITEMS = [
  "Free shipping over $150",
  "AI-powered visual search",
  "30-day trial period",
  "Enterprise concierge",
];

const HERO_SHOES = [
  { src: "/images/Apex_Runner_Pro_Series_A_Black.png", cls: "animate-float", style: "right-[-8%] top-[16%] w-[46vw] max-w-[560px] opacity-70" },
  { src: "/images/Apex_Runner_Pro_Series_G_Green.png", cls: "animate-float-delay-1", style: "right-[26%] top-[52%] w-[30vw] max-w-[360px] opacity-50" },
  { src: "/images/Apex_Runner_Pro_Series_A_Red.png", cls: "animate-float-delay-2", style: "right-[2%] top-[62%] w-[24vw] max-w-[280px] opacity-40" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedShoeId, setSelectedShoeId] = useState<number | null>(null);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (recommendations.length > 0) {
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [recommendations]);

  function jumpToCategory(cat: string) {
    setCategory(cat);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleAddToCart(item: CartItem) {
    setCart((prev) => [...prev, item]);
    // Fire-and-forget: logs this for the assisted-vs-direct conversion metric.
    // Never awaited, never blocks the cart, and a failure here is silently
    // swallowed - a logging gap should never be able to break a real purchase.
    fetch(`${API_URL}/log-cart-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, name: item.name, price: item.price, source: "modal" }),
    }).catch(() => {});
  }

  function handleAskAboutShoe(shoe: Shoe) {
    setPendingQuestion(`Tell me more about the ${shoe.model}.`);
    setConciergeOpen(true);
    setSelectedShoeId(null);
  }

  const selectedShoe = catalog.find((s) => s.id === selectedShoeId) ?? null;
  const selectedRec = selectedShoeId ? recommendations.find((r) => r.id === selectedShoeId) ?? null : null;
  const spotlightShoe = catalog.find((s) => s.model === "TrailBlazer X Series V") ?? null;

  return (
    <>
      <Nav cartCount={cart.length} category={category} onCategoryChange={jumpToCategory} />

      <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-center px-6 pt-16">
        {HERO_SHOES.map((shoe) => (
          <div key={shoe.src} className={`absolute pointer-events-none ${shoe.style}`}>
            <div className={shoe.cls}>
              <img src={shoe.src} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} className="w-full animate-slow-zoom drop-shadow-[0_40px_60px_rgba(18,232,160,0.15)]" />
            </div>
          </div>
        ))}

        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[2px] h-24 bg-accent rotate-12 opacity-80" />

        <div className="relative max-w-6xl mx-auto w-full">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6 rise-in">Veloxa Concierge</p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]">
            <span className="block rise-in-delay-1">Defy Gravity.</span>
            <span className="block rise-in-delay-2 text-accent">Embrace Speed.</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted max-w-xl rise-in-delay-3">
            Powered by Enterprise Visual Search &amp; Agentic Tools.
          </p>
          <a href="#shop" className="mt-10 inline-flex items-center gap-2 bg-accent text-background font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity rise-in-delay-3">
            Shop the Collection
          </a>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="mx-8 text-xs tracking-[0.2em] uppercase text-muted">
                {item} <span className="text-accent ml-8">✦</span>
              </span>
            ))}
          </div>
        </div>
      </main>

      {spotlightShoe && (
        <section className="bg-background text-foreground border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center p-12">
              <img
                src={`/images/${spotlightShoe.model.replace(/ /g, "_")}_Black.png`}
                alt={spotlightShoe.model}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                className="max-w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.4)]"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Premium Tier · {spotlightShoe.category}</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {spotlightShoe.model.replace(" Series", " — Series")}
              </h2>
              <p className="text-muted text-base leading-relaxed max-w-md mb-6">
                Stability support paired with a minimal heel-to-toe drop — built for runners who want real ground feedback without giving up structure.
              </p>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl font-bold">${spotlightShoe.finalPrice}</span>
                {spotlightShoe.price !== spotlightShoe.finalPrice && (
                  <span className="text-muted line-through">${spotlightShoe.price}</span>
                )}
              </div>
              <button
                onClick={() => jumpToCategory(spotlightShoe.category)}
                className="bg-accent text-background font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Shop {spotlightShoe.category}
              </button>
            </div>
          </div>
        </section>
      )}

      <div id="shop">
        <CatalogGrid
          recommendations={recommendations}
          category={category}
          onSelectShoe={setSelectedShoeId}
        />
      </div>

      <section className="bg-paper border-t border-line px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 rounded-2xl overflow-hidden border border-line">
          <div className="bg-white p-10 md:p-14 flex flex-col justify-center">
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">AI Style Concierge</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-4">Your personal fit expert, on call</h2>
            <p className="text-subtle text-base leading-relaxed max-w-sm mb-8">
              Upload a photo, describe how you run, or just ask — enterprise visual search and agentic recommendations do the rest.
            </p>
            <button
              onClick={() => setConciergeOpen(true)}
              className="bg-ink text-paper font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity self-start"
            >
              Start a Conversation
            </button>
          </div>
          <div className="bg-background p-6 flex flex-col">
            <div className="flex items-center gap-2 text-white text-sm font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Veloxa Concierge · Online
            </div>
            <div className="bg-white/10 text-muted text-sm rounded-2xl rounded-tl-sm px-4 py-3 mb-4 max-w-[90%]">
              Welcome to Veloxa. How may I assist you today?
            </div>
            <div className="flex flex-wrap gap-2">
              {["Find me running shoe", "Style advice"].map((q) => (
                <span key={q} className="border border-white/15 text-muted text-xs px-3 py-1.5 rounded-full">
                  {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background text-foreground border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-bold">VELOXA<span className="text-accent">.</span></p>
            <p className="mt-1 text-sm text-muted">Enterprise AI shopping, demonstrated.</p>
          </div>
          <div className="flex gap-8 text-sm text-muted">
            <a href="#shop" className="hover:text-foreground transition-colors">Shop</a>
            <a href="mailto:support@veloxa.com" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {selectedShoe && (
        <ShoeModal
          shoe={selectedShoe}
          recommendation={selectedRec}
          onAddToCart={handleAddToCart}
          onClose={() => setSelectedShoeId(null)}
          onAskDetails={handleAskAboutShoe}
        />
      )}

      <ConciergePanel
        isOpen={conciergeOpen}
        onOpenChange={setConciergeOpen}
        onRecommendations={setRecommendations}
        cart={cart}
        setCart={setCart}
        onSelectShoe={setSelectedShoeId}
        pendingQuestion={pendingQuestion}
        onPendingConsumed={() => setPendingQuestion(null)}
        sessionId={sessionId}
      />
    </>
  );
}