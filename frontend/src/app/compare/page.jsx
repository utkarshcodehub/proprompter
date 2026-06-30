"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import Navbar from "@/components/Navbar";

const MODEL_COLORS = {
  auto: "#888580", chatgpt: "#5B8FF9", claude: "#9B7FF4",
  midjourney: "#F5A623", cursor: "#3ECF8E",
};

const CHANGE_COLORS = {
  added:        { bg: "rgba(62,207,142,0.1)",  text: "#3ECF8E" },
  stripped:     { bg: "rgba(229,83,83,0.1)",   text: "#E55353" },
  restructured: { bg: "rgba(155,127,244,0.1)", text: "#9B7FF4" },
  specified:    { bg: "rgba(91,143,249,0.1)",  text: "#5B8FF9" },
  reframed:     { bg: "rgba(245,166,35,0.1)",  text: "#F5A623" },
};

function PromptColumn({ result, mode, accentColor }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const deltaColor = result.tokens_delta <= 0 ? "var(--green)" : "var(--amber)";
  const deltaText  = result.tokens_delta === 0 ? "±0" : result.tokens_delta > 0 ? `+${result.tokens_delta}` : result.tokens_delta;
  const scoreColor = result.quality_score >= 90 ? "var(--green)" : result.quality_score >= 70 ? "var(--amber)" : "var(--red)";
  const c          = 2 * Math.PI * 14;
  const offset     = c - (result.quality_score / 100) * c;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
      {/* Column header */}
      <div style={{ background: "var(--bg-card)", border: `1px solid ${accentColor}30`, borderTop: `2px solid ${accentColor}`, borderRadius: "12px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
            {mode === "lean" ? "⚡ Lean" : "Structured"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
            {mode === "lean" ? "Token-efficient, minimal" : "Full framework, repeatable"}
          </div>
        </div>
        <svg width="34" height="34" viewBox="0 0 34 34">
          <circle cx="17" cy="17" r="14" fill="none" stroke="var(--border-light)" strokeWidth="2.5"/>
          <circle cx="17" cy="17" r="14" fill="none" stroke={scoreColor} strokeWidth="2.5"
            strokeDasharray={c} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 17 17)"
            style={{ transition: "stroke-dashoffset .6s ease" }}/>
          <text x="17" y="21" textAnchor="middle" fill={scoreColor} style={{ fontSize: "9px", fontFamily: "Syne", fontWeight: 700 }}>
            {result.quality_score}
          </text>
        </svg>
      </div>

      {/* Token count */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Tokens</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-secondary)" }}>{result.token_estimate_before}</span>
          <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>→</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)" }}>{result.token_estimate_after}</span>
          <span style={{ padding: "2px 7px", borderRadius: "5px", background: result.tokens_delta <= 0 ? "rgba(62,207,142,0.1)" : "rgba(245,166,35,0.1)", color: deltaColor, fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 500 }}>
            {deltaText}
          </span>
        </div>
      </div>

      {/* Prompt */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", flex: 1 }}>
        <div style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: accentColor, fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Prompt</span>
          <button onClick={() => { navigator.clipboard.writeText(result.optimized_prompt); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
            padding: "3px 8px", borderRadius: "6px",
            background: copied ? "rgba(62,207,142,0.1)" : "var(--bg)",
            border: `1px solid ${copied ? "var(--green)" : "var(--border)"}`,
            color: copied ? "var(--green)" : "var(--text-secondary)",
            fontSize: "11px", cursor: "pointer", transition: "all .15s",
          }}>
            {copied ? "✓ Copied" : "⎘ Copy"}
          </button>
        </div>
        <pre style={{ padding: "13px", fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.75, color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
          {result.optimized_prompt}
        </pre>
      </div>

      {/* Explanation */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "11px 13px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        <div style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>Explanation</div>
        {result.explanation}
      </div>

      {/* Changes */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Changes ({result.changes_made?.length || 0})
        </div>
        {!result.changes_made?.length ? (
          <div style={{ padding: "12px", fontSize: "12px", color: "var(--text-tertiary)" }}>Already precise.</div>
        ) : result.changes_made.map((c, i) => {
          const cs = CHANGE_COLORS[c.type] || {};
          return (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "8px 12px", borderBottom: i < result.changes_made.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span style={{ padding: "2px 6px", borderRadius: "4px", background: cs.bg, color: cs.text, fontSize: "9px", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".04em", flexShrink: 0, marginTop: "2px" }}>{c.type}</span>
              <span style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.detail}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { user, loading: authLoading } = useAuth();
  const { todayCount } = useHistory(user?.id);

  const [input, setInput]     = useState("");
  const [model, setModel]     = useState("auto");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError]     = useState(null);

  const handleCompare = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), model }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(res.status === 429
          ? "Daily compare limit reached (3/day on free tier)."
          : data?.detail?.message || "Something went wrong.");
        return;
      }
      setResults(await res.json());
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar todayCount={todayCount} />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>Compare Modes</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Run both lean and structured on the same input. See the trade-off side by side.</p>
          <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--text-tertiary)", padding: "5px 10px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "7px", display: "inline-block" }}>
            Costs 2 API calls — 3 compares/day on free tier
          </div>
        </div>

        {/* Input */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", marginBottom: "16px" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => (e.metaKey || e.ctrlKey) && e.key === "Enter" && handleCompare()}
            placeholder="Enter your raw prompt to compare both optimization modes..."
            rows={3}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", padding: "16px 18px", fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-body), DM Sans, sans-serif", lineHeight: 1.7, resize: "none" }}
          />
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {Object.keys(MODEL_COLORS).map(m => (
                <button key={m} onClick={() => setModel(m)} style={{
                  padding: "4px 10px", borderRadius: "14px", fontSize: "11px", fontWeight: 500,
                  border: model === m ? `1px solid ${MODEL_COLORS[m]}` : "1px solid var(--border)",
                  background: model === m ? `${MODEL_COLORS[m]}18` : "transparent",
                  color: model === m ? MODEL_COLORS[m] : "var(--text-secondary)",
                  cursor: "pointer", fontFamily: "var(--font-display)", transition: "all .15s",
                }}>{m}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>⌘↵</span>
              <button onClick={handleCompare} disabled={!input.trim() || loading} style={{
                padding: "8px 20px",
                background: input.trim() && !loading ? "var(--amber)" : "var(--bg-hover)",
                border: "none", borderRadius: "9px",
                color: input.trim() && !loading ? "#000" : "var(--text-tertiary)",
                fontSize: "13px", fontWeight: 700,
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                fontFamily: "var(--font-display)", transition: "all .15s",
              }}>
                {loading ? "Comparing…" : "↔ Compare"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(229,83,83,0.08)", border: "1px solid rgba(229,83,83,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "20px" }}>{error}</div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[0, 1].map(i => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[80, 50, 180, 70, 110].map((h, j) => (
                  <div key={j} style={{ height: `${h}px`, borderRadius: "12px", background: "linear-gradient(90deg,var(--bg-card) 25%,var(--bg-hover) 50%,var(--bg-card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px", padding: "10px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Recommended:</span>
              <span style={{
                padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: 700,
                background: results.delta.recommendation === "lean" ? "rgba(62,207,142,0.1)" : "rgba(155,127,244,0.1)",
                color: results.delta.recommendation === "lean" ? "var(--green)" : "var(--purple)",
                fontFamily: "var(--font-display)",
              }}>
                {results.delta.recommendation === "lean" ? "⚡ Lean" : "Structured"} mode
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                Score gap: {Math.abs(results.delta.score_difference)} pts · Token diff: {results.delta.token_difference > 0 ? `+${results.delta.token_difference}` : results.delta.token_difference}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <PromptColumn result={results.lean}       mode="lean"       accentColor="var(--green)"  />
              <PromptColumn result={results.structured} mode="structured" accentColor="var(--purple)" />
            </div>
          </>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: "36px", opacity: .25, marginBottom: "12px" }}>↔</div>
            <div style={{ fontSize: "13px" }}>Enter a prompt above to see both modes side by side</div>
          </div>
        )}
      </main>
    </div>
  );
}