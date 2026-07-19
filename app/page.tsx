"use client";

import { useState } from "react";
import Nav from "./components/Nav";
import CatalogGrid, { type Recommendation } from "./components/CatalogGrid";
import ConciergePanel from "./components/ConciergePanel";

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  return (
    <>
      <Nav />

      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden pt-16">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[2px] h-24 bg-accent rotate-12 opacity-80" />

        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">
          Veloxa Concierge
        </p>

        <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight text-center leading-[0.9]">
          Defy Gravity.
          <br />
          Embrace Speed.
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted text-center max-w-xl">
          Powered by Enterprise Visual Search & Agentic Tools.
        </p>

        
          <a href="#shop"
  className="mt-10 inline-flex items-center gap-2 bg-accent text-background font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity">
  Shop the Collection
</a>
      </main>

      <div id="shop">
        <CatalogGrid recommendations={recommendations} />
      </div>
      <ConciergePanel onRecommendations={setRecommendations} />
    </>
  );
}