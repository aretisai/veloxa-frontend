"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface IntentDistribution {
  CONTINUE: number;
  ESCALATE: number;
  DECLINE_PROMPT: number;
  DECLINE_PRIVACY: number;
  OFF_TOPIC: number;
}

interface Metrics {
  window_days: number;
  total_conversations: number | null;
  avg_response_seconds: number | null;
  escalations: number | null;
  tool_calls: number | null;
  total_cost_usd: number | null;
  deflection_rate_pct: number | null;
  revenue_attributed_usd: number | null;
  assisted_revenue_usd: number | null;
  direct_revenue_usd: number | null;
  privacy_declines: number | null;
  prompt_injection_declines: number | null;
  premium_fallback_count: number | null;
  validator_pass: number | null;
  validator_fail: number | null;
  hallucination_rate_pct: number | null;
  citation_checked: number | null;
  price_accuracy_pct: number | null;
  colour_flag_count: number | null;
  intent_distribution: IntentDistribution | null;
  images_analysed: number | null;
  images_rejected: number | null;
  images_platform_blocked: number | null;
  csat_score_pct: number | null;
  csat_responses: number | null;
  avg_csat_rating: number | null;
  csat_with_comments: number | null;
  avg_product_rating: number | null;
  review_count: number | null;
  reviews_with_comments: number | null;
  error: string | null;
}

const EMPTY_METRICS = (error: string): Metrics => ({
  window_days: 7,
  total_conversations: null,
  avg_response_seconds: null,
  escalations: null,
  tool_calls: null,
  total_cost_usd: null,
  deflection_rate_pct: null,
  revenue_attributed_usd: null,
  assisted_revenue_usd: null,
  direct_revenue_usd: null,
  privacy_declines: null,
  prompt_injection_declines: null,
  premium_fallback_count: null,
  validator_pass: null,
  validator_fail: null,
  hallucination_rate_pct: null,
  citation_checked: null,
  price_accuracy_pct: null,
  colour_flag_count: null,
  intent_distribution: null,
  images_analysed: null,
  images_rejected: null,
  images_platform_blocked: null,
  csat_score_pct: null,
  csat_responses: null,
  avg_csat_rating: null,
  csat_with_comments: null,
  avg_product_rating: null,
  review_count: null,
  reviews_with_comments: null,
  error,
});

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // First load shows skeletons; a refresh keeps the previous numbers on screen
  // (dimmed) so the page never flashes back to an empty state.
  const isFirstLoad = loading && metrics === null;
  const isRefreshing = loading && metrics !== null;

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    // cache: "no-store" rules out the browser silently reusing a cached
    // response - refreshKey in the dependency array means this genuinely
    // re-runs on demand, not just once when the component happens to mount.
    fetch(`${API_URL}/admin/metrics`, { signal: controller.signal, cache: "no-store" })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        return res.json();
      })
      .then(setMetrics)
      .catch((err) =>
        setMetrics(
          EMPTY_METRICS(
            err?.name === "AbortError"
              ? "Metrics are taking too long to load - the backend may be under load."
              : "Could not reach backend"
          )
        )
      )
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const escalationRatePct =
    metrics?.total_conversations && metrics?.escalations !== null && metrics?.escalations !== undefined
      ? Math.round((metrics.escalations / metrics.total_conversations) * 1000) / 10
      : null;

  const showData = metrics !== null && !metrics.error;
  const dist = metrics?.intent_distribution ?? null;
  const distTotal = dist
    ? dist.CONTINUE + dist.ESCALATE + dist.DECLINE_PROMPT + dist.DECLINE_PRIVACY + dist.OFF_TOPIC
    : 0;

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">Internal</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Admin Analytics</h1>
        <div className="flex items-center justify-between mb-12">
          <p className="text-muted text-sm">
            Live activity from Langfuse{metrics ? `, last ${metrics.window_days} days` : ""}.
          </p>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="text-xs border border-white/15 text-muted px-3 py-1.5 rounded-full hover:text-foreground hover:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span className={isRefreshing ? "inline-block animate-spin" : "inline-block"}>↻</span>
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        {metrics?.error && <p className="text-red-400 text-sm mb-8">{metrics.error}</p>}

        {/* The layout renders immediately either way - on first load the cards
            are skeletons, on refresh the previous values stay visible but dimmed. */}
        <div className={isRefreshing ? "opacity-40 transition-opacity duration-200" : "transition-opacity duration-200"}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Conversations" value={metrics?.total_conversations ?? null} skeleton={isFirstLoad} />
            <StatCard label="Avg. Response Time" value={metrics?.avg_response_seconds ?? null} suffix="s" skeleton={isFirstLoad} />
            <StatCard label="Cart Actions" value={metrics?.tool_calls ?? null} skeleton={isFirstLoad} />
            <StatCard
              label="Escalations"
              value={metrics?.escalations ?? null}
              tone={metrics?.escalations && metrics.escalations > 0 ? "warn" : "default"}
              skeleton={isFirstLoad}
            />
            <StatCard label="Total Cost" value={metrics?.total_cost_usd ?? null} prefix="$" skeleton={isFirstLoad} />
          </div>

          <SectionHeading
            title="Business Value & ROI"
            note="Is the system actively driving revenue or cutting operational cost?"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Self-Service Deflection"
              value={metrics?.deflection_rate_pct ?? null}
              suffix="%"
              sub="Resolved without human escalation"
              tone="good"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Total Revenue Attribution"
              value={metrics?.revenue_attributed_usd ?? null}
              prefix="$"
              sub="All cart value, chat + product page combined"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Assisted Conversions"
              value={metrics?.assisted_revenue_usd ?? null}
              prefix="$"
              sub="Chat-executed, or product-page adds within a session that also used chat"
              tone="good"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Direct Conversions"
              value={metrics?.direct_revenue_usd ?? null}
              prefix="$"
              sub="Product-page adds with no chat activity in that session"
              skeleton={isFirstLoad}
            />
          </div>

          <SectionHeading
            title="Grounding & Factual Accuracy"
            note="Two independent checks: an LLM judge on product claims, and a deterministic comparison of stated prices against the catalog"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Price Accuracy"
              value={metrics?.price_accuracy_pct ?? null}
              suffix="%"
              sub={
                showData && metrics.citation_checked
                  ? `Verified against PostgreSQL across ${metrics.citation_checked} replies`
                  : "Deterministic check - no LLM judgement involved"
              }
              tone={
                metrics?.price_accuracy_pct !== null &&
                metrics?.price_accuracy_pct !== undefined &&
                metrics.price_accuracy_pct < 100
                  ? "warn"
                  : "good"
              }
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Ungrounded Product Claims"
              value={metrics?.hallucination_rate_pct ?? null}
              suffix="%"
              sub={
                showData && metrics.validator_fail !== null && metrics.validator_pass !== null
                  ? `${metrics.validator_fail} blocked of ${metrics.validator_pass + metrics.validator_fail} validated`
                  : undefined
              }
              tone={
                metrics?.hallucination_rate_pct !== null &&
                metrics?.hallucination_rate_pct !== undefined &&
                metrics.hallucination_rate_pct > 5
                  ? "warn"
                  : "good"
              }
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Colour Mentions Flagged"
              value={metrics?.colour_flag_count ?? null}
              sub="Heuristic - a colour named that is not on any retrieved product. Expect some false positives from descriptive language."
              skeleton={isFirstLoad}
            />
          </div>

          <SectionHeading
            title="Trust, Risk & Compliance"
            note="PCI compliance status and bias/equity monitoring intentionally omitted - not applicable to this system"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Privacy Events Caught"
              value={metrics?.privacy_declines ?? null}
              sub="Third-party data requests declined"
              tone="good"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Security Anomalies Caught"
              value={metrics?.prompt_injection_declines ?? null}
              sub="Prompt injection attempts declined"
              tone="good"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Model Fallback Events"
              value={metrics?.premium_fallback_count ?? null}
              sub="Premium failed, Commodity took over"
              skeleton={isFirstLoad}
            />
          </div>

          <SectionHeading
            title="Intent Classification Distribution"
            note="How the Intent Router classified every message. A sudden shift in this split indicates behavioural drift - accuracy itself is measured by the golden test set, not here."
          />
          {isFirstLoad ? (
            <div className="border border-white/10 rounded-xl p-6">
              <div className="h-24 w-full rounded bg-white/5 animate-pulse" />
            </div>
          ) : (
            <div className="border border-white/10 rounded-xl p-6">
              {dist && distTotal > 0 ? (
                <div className="space-y-3">
                  {(
                    [
                      ["CONTINUE", dist.CONTINUE, "bg-emerald-400"],
                      ["ESCALATE", dist.ESCALATE, "bg-amber-400"],
                      ["DECLINE_PROMPT", dist.DECLINE_PROMPT, "bg-red-400"],
                      ["DECLINE_PRIVACY", dist.DECLINE_PRIVACY, "bg-red-400"],
                      ["OFF_TOPIC", dist.OFF_TOPIC, "bg-white/40"],
                    ] as [string, number, string][]
                  ).map(([label, count, colour]) => {
                    const pct = distTotal > 0 ? (count / distTotal) * 100 : 0;
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-muted w-36 shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full ${colour} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-foreground w-20 text-right shrink-0">
                          {count} · {pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-sm">
                  No classified messages in this window yet. This populates as new conversations come in.
                </p>
              )}
            </div>
          )}

          <SectionHeading
            title="Image Safety"
            note="Two layers: the model provider's own platform filter blocks severe categories before analysis, and an application-level verdict rejects content unsuitable for a retail context"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Images Analysed"
              value={metrics?.images_analysed ?? null}
              sub="Uploads that reached the Vision Agent"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Images Rejected"
              value={metrics?.images_rejected ?? null}
              sub="Blocked before reaching retrieval or generation"
              tone={metrics?.images_rejected ? "warn" : "good"}
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Platform-Filter Blocks"
              value={metrics?.images_platform_blocked ?? null}
              sub="Caught by the provider's own safety filter, now detected and logged rather than failing silently"
              skeleton={isFirstLoad}
            />
          </div>

          <SectionHeading
            title="Customer Experience & Quality"
            note="Sentiment trajectory and predictive escalation intentionally omitted - not yet measurable"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Conversation CSAT"
              value={metrics?.avg_csat_rating ?? null}
              suffix=" / 5"
              sub={
                showData && metrics.csat_responses
                  ? `${metrics.csat_score_pct}% rated 4+ · ${metrics.csat_responses} ${metrics.csat_responses === 1 ? "response" : "responses"}, ${metrics.csat_with_comments ?? 0} with comments`
                  : "End-of-conversation survey, 1-5 scale"
              }
              tone={
                metrics?.csat_score_pct !== null &&
                metrics?.csat_score_pct !== undefined &&
                metrics.csat_score_pct < 70
                  ? "warn"
                  : "good"
              }
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Escalation Rate"
              value={escalationRatePct}
              suffix="%"
              sub="Correctly routed to a human"
              skeleton={isFirstLoad}
            />
            <StatCard
              label="Avg. Product Rating"
              value={metrics?.avg_product_rating ?? null}
              suffix=" / 5"
              sub={
                showData && metrics.review_count
                  ? `${metrics.review_count} ${metrics.review_count === 1 ? "review" : "reviews"}, ${metrics.reviews_with_comments ?? 0} with written feedback`
                  : "Customer reviews submitted on product pages"
              }
              skeleton={isFirstLoad}
            />
          </div>

          <SectionHeading
            title="Operational Oversight"
            note="Human-in-Command: humans set the rules and audit outcomes, rather than reviewing each conversation"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Audit Trail Status"
              value={metrics?.total_conversations != null ? 1 : null}
              sub="Every conversation logged immutably in Langfuse"
              tone="good"
              displayOverride={metrics?.total_conversations != null ? "Active" : undefined}
              skeleton={isFirstLoad}
            />
          </div>
        </div>

        <p className="text-xs text-muted mt-12 pt-6 border-t border-white/10">
          Total cost is summed across all agent steps (Intent Router, Concierge, Vision, Output Validator) over the
          selected window. Every figure on this page is pulled live from Langfuse - nothing is a projected estimate.
          Agent accuracy is measured separately by the golden test set, which scores each agent against known-correct
          expected outcomes rather than against another model.
        </p>
      </div>
    </main>
  );
}

function SectionHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="mt-12 mb-4">
      <p className="text-xs tracking-[0.3em] uppercase text-accent mb-1">{title}</p>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  sub,
  tone = "default",
  displayOverride,
  skeleton = false,
}: {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
  sub?: string;
  tone?: "default" | "warn" | "good";
  displayOverride?: string;
  skeleton?: boolean;
}) {
  const toneClass =
    tone === "warn" ? "text-amber-400" : tone === "good" ? "text-emerald-400" : "text-foreground";

  return (
    <div className="border border-white/10 rounded-xl p-6">
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{label}</p>
      {skeleton ? (
        // Height matches the real number line so nothing shifts when data lands.
        <div className="h-10 w-24 rounded bg-white/10 animate-pulse" />
      ) : (
        <p className={`font-display text-4xl font-bold ${toneClass}`}>
          {displayOverride ?? (value !== null ? `${prefix}${value}${suffix}` : "N/A")}
        </p>
      )}
      {sub && <p className="text-xs text-muted mt-2">{sub}</p>}
      {skeleton && !sub && <div className="h-3 w-32 rounded bg-white/5 animate-pulse mt-3" />}
    </div>
  );
}
