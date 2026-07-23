"use client";

import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import CatalogGrid, { type Recommendation, type CartItem } from "./components/CatalogGrid";
import ConciergePanel from "./components/ConciergePanel";

const MARQUEE_ITEMS = [
  "Free shipping over $150",
  "AI-powered visual search",
  "30-day trial period",
  "Enterprise concierge",
];

const COLLECTIONS = [
  { name: "Road Running", tagline: "Built for pace on pavement" },
  { name: "Trail Running", tagline: "Grip for the unpredictable" },
  { name: "Track & Field", tagline: "Engineered for the start gun" },
  { name: "Lifestyle", tagline: "Performance, off the clock" },
];

const HERO_SHOES = [
  { src: "/images/Apex_Runner_Pro_Series_A_Black.png", cls: "animate-float", style: "right-[-8%] top-[16%] w-[46vw] max-w-[560px] opacity-70" },
  { src: "/images/Apex_Runner_Pro_Series_G_Green.png", cls: "animate-float-delay-1", style: "right-[26%] top-[52%] w-[30vw] max-w-[360px] opacity-50" },
  { src: "/images/Apex_Runner_Pro_Series_A_Red.png", cls: "animate-float-delay-2", style: "right-[2%] top-[62%] w-[24vw] max-w-[280px] opacity-40" },
];

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);

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
  }

  return (
    <>
      <Nav cartCount={cart.length} />

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

      <section id="collections" className="bg-background text-foreground border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-10">Collections</p>
          <div className="grid md:grid-cols-2 gap-px bg-white/10">
            {COLLECTIONS.map((col) => (
              <button key={col.name} onClick={() => jumpToCategory(col.name)} className="group text-left bg-background p-8 md:p-10 hover:bg-accent transition-colors duration-300">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground group-hover:text-background transition-colors">{col.name}</h3>
                <p className="mt-2 text-sm text-muted group-hover:text-background/70 transition-colors">{col.tagline}</p>
                <span className="mt-6 inline-block text-sm text-accent group-hover:text-background transition-colors">Browse →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div id="shop">
        <CatalogGrid
          recommendations={recommendations}
          category={category}
          onCategoryChange={setCategory}
          onAddToCart={handleAddToCart}
        />
      </div>

      <footer className="bg-background text-foreground border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-bold">VELOXA<span className="text-accent">.</span></p>
            <p className="mt-1 text-sm text-muted">Enterprise AI shopping, demonstrated.</p>
          </div>
          <div className="flex gap-8 text-sm text-muted">
            <a href="#collections" className="hover:text-foreground transition-colors">Collections</a>
            <a href="#shop" className="hover:text-foreground transition-colors">Shop</a>
            <a href="mailto:support@veloxa.com" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <ConciergePanel onRecommendations={setRecommendations} cart={cart} setCart={setCart} />
    </>
  );
}