"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Metrics {
  window_days: number;
  total_conversations: number | null;
  avg_response_seconds: number | null;
  escalations: number | null;
  tool_calls: number | null;
  error: string | null;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/metrics`)
      .then((res) => res.json())
      .then(setMetrics)
      .catch(() =>
        setMetrics({
          window_days: 7,
          total_conversations: null,
          avg_response_seconds: null,
          escalations: null,
          tool_calls: null,
          error: "Could not reach backend",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">Internal</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Admin Analytics</h1>
        <p className="text-muted text-sm mb-12">
          Live activity from Langfuse{metrics ? `, last ${metrics.window_days} days` : ""}.
        </p>

        {loading && <p className="text-muted">Loading metrics...</p>}

        {!loading && metrics?.error && <p className="text-red-400 text-sm">{metrics.error}</p>}

        {!loading && metrics && !metrics.error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Conversations" value={metrics.total_conversations} />
            <StatCard label="Avg. Response Time" value={metrics.avg_response_seconds} suffix="s" />
            <StatCard label="Cart Actions" value={metrics.tool_calls} />
            <StatCard
              label="Escalations"
              value={metrics.escalations}
              tone={metrics.escalations && metrics.escalations > 0 ? "warn" : "default"}
            />
          </div>
        )}

        <p className="text-xs text-muted mt-12">
          Cost-per-session isn&apos;t tracked yet — planned as a follow-up once Gemini calls are tagged with token usage.
        </p>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix = "",
  tone = "default",
}: {
  label: string;
  value: number | null;
  suffix?: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="border border-white/10 rounded-xl p-6">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{label}</p>
      <p className={`font-display text-4xl font-bold ${tone === "warn" ? "text-amber-400" : "text-foreground"}`}>
        {value ?? "—"}
        {value !== null && suffix}
      </p>
    </div>
  );
}