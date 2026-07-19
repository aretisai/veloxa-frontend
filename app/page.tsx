"use client";

import { useState } from "react";
import CatalogGrid, { type Recommendation } from "./components/CatalogGrid";
import ConciergePanel from "./components/ConciergePanel";

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  return (
    <>
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-24 bg-accent rotate-12 opacity-80" />

        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">
          Veloxa Concierge
        </p>

        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-center leading-[0.95]">
          Defy Gravity.
          <br />
          Embrace Speed.
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted text-center max-w-xl">
          Powered by Enterprise Visual Search & Agentic Tools.
        </p>
      </main>

      <CatalogGrid recommendations={recommendations} />
      <ConciergePanel onRecommendations={setRecommendations} />
    </>
  );
}