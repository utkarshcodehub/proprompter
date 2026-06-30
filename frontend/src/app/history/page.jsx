"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import Navbar from "@/components/Navbar";

const MODEL_COLORS = {
  chatgpt: "#5B8FF9", claude: "#9B7FF4",
  midjourney: "#F5A623", cursor: "#3ECF8E", generic: "#888580",
};

const CHANGE_COLORS = {
  added:        { bg: "rgba(62,207,142,0.1)",  text: "#3ECF8E" },
  stripped:     { bg: "rgba(229,83,83,0.1)",   text: "#E55353" },
  restructured: { bg: "rgba(155,127,244,0.1)", text: "#9B7FF4" },
  specified:    { bg: "rgba(91,143,249,0.1)",  text: "#5B8FF9" },
  reframed:     { bg: "rgba(245,166,35,0.1)",  text: "#F5A623" },
};

function HistoryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mc = MODEL_COLORS[item.detected_model] || "#888";
  const dc = item.tokens_delta <= 0 ? "var(--green)" : "var(--amber)";
  const dt = item.tokens_delta === 0 ? "±0" : item.tokens_delta > 0 ? `+${item.tokens_delta}` : item.tokens_delta;
  const sc = item.quality_score >= 90 ? "var(--green)" : item.quality_score >= 70 ? "var(--amber)" : "var(--red)";
  const mc2 = item.mode === "lean"
    ? { bg: "rgba(62,207,142,0.1)", c: "#3ECF8E" }
    : { bg: "rgba(155,127,244,0.1)", c: "#9B7FF4" };

  const date = new Date(item.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.optimized_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this prompt from history?")) return;
    setDeleting(true);
    await onDelete(item.id);
  };

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "14px", overflow: "hidden",
      transition: "border-color .2s", opacity: deleting ? 0.5 : 1,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Header row */}
      <div
        style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: mc, flexShrink: 0, marginTop: "6px" }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "13.5px", fontWeight: 500,
            color: "var(--text-primary)", marginBottom: "5px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{item.input}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "5px", border: `1px solid ${mc}40`, color: mc, fontFamily: "var(--font-display)", fontWeight: 600 }}>
              {item.detected_model}
            </span>
            <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "5px", background: mc2.bg, color: mc2.c, fontFamily: "var(--font-display)", fontWeight: 600 }}>
              {item.mode}
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{date}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: dc }}>{dt} tokens</div>
            <div style={{ fontSize: "11px", color: sc, fontFamily: "var(--font-display)", fontWeight: 600, marginTop: "2px" }}>
              {item.quality_score}/100
            </div>
          </div>
          <svg style={{ color: "var(--text-tertiary)", transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px" }} onClick={e => e.stopPropagation()}>

          {/* Optimized prompt */}
          <pre style={{
            fontFamily: "var(--font-mono)", fontSize: "12.5px",
            color: "var(--text-secondary)", lineHeight: 1.7,
            background: "var(--bg)", borderRadius: "10px",
            padding: "12px 14px", marginBottom: "12px",
            whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "0 0 12px 0",
          }}>{item.optimized_prompt}</pre>

          {/* Explanation */}
          {item.explanation && (
            <div style={{
              fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6,
              padding: "10px 13px", background: "rgba(245,166,35,0.05)",
              border: "1px solid rgba(245,166,35,0.15)", borderRadius: "9px", marginBottom: "12px",
            }}>
              <span style={{ color: "var(--amber)", fontWeight: 600, marginRight: "6px" }}>Why it's better:</span>
              {item.explanation}
            </div>
          )}

          {/* Changes */}
          {item.changes_made?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              {item.changes_made.map((c, i) => {
                const cs = CHANGE_COLORS[c.type] || {};
                return (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "6px 0", borderBottom: i < item.changes_made.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ padding: "2px 6px", borderRadius: "4px", background: cs.bg, color: cs.text, fontSize: "9px", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", flexShrink: 0, marginTop: "2px" }}>{c.type}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.detail}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleCopy} style={{
              padding: "6px 12px", borderRadius: "8px",
              background: copied ? "rgba(62,207,142,0.1)" : "var(--bg)",
              border: `1px solid ${copied ? "var(--green)" : "var(--border)"}`,
              color: copied ? "var(--green)" : "var(--text-secondary)",
              fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-display)", transition: "all .15s",
            }}>
              {copied ? "✓ Copied!" : "⎘ Copy"}
            </button>
            <a href={`/?input=${encodeURIComponent(item.input)}&mode=${item.mode}&model=${item.detected_model}`} style={{
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
              color: "var(--amber)", fontSize: "12px", textDecoration: "none",
              fontFamily: "var(--font-display)",
            }}>
              ↩ Re-optimize
            </a>
            <button onClick={handleDelete} style={{
              marginLeft: "auto", padding: "6px 12px", borderRadius: "8px",
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--red)", fontSize: "12px", cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { history, loading, todayCount, deletePrompt } = useHistory(user?.id);

  const [search, setSearch]           = useState("");
  const [filterModel, setFilterModel] = useState("all");
  const [filterMode, setFilterMode]   = useState("all");

  const filtered = useMemo(() => {
    return history.filter(h => {
      const matchSearch = !search || h.input.toLowerCase().includes(search.toLowerCase());
      const matchModel  = filterModel === "all" || h.detected_model === filterModel;
      const matchMode   = filterMode === "all" || h.mode === filterMode;
      return matchSearch && matchModel && matchMode;
    });
  }, [history, search, filterModel, filterMode]);

  const stats = useMemo(() => ({
    total:    history.length,
    saved:    Math.abs(history.reduce((a, h) => a + Math.min(0, h.tokens_delta || 0), 0)),
    avgScore: history.length ? Math.round(history.reduce((a, h) => a + (h.quality_score || 0), 0) / history.length) : 0,
  }), [history]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <div style={{ maxWidth: "400px", margin: "8rem auto", textAlign: "center", padding: "0 1.5rem" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px", opacity: .4 }}>📋</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Sign in to see your history</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Your prompt history is saved automatically when you're signed in.</p>
          <a href="/login" style={{ padding: "10px 24px", background: "var(--amber)", borderRadius: "10px", color: "#000", fontSize: "13px", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-display)" }}>Sign in</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar todayCount={todayCount} />
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>Prompt History</h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Every optimization you've run, searchable and reusable.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Total optimized", value: stats.total,    unit: "prompts" },
            { label: "Tokens net saved", value: stats.saved,   unit: "tokens"  },
            { label: "Avg quality",      value: stats.avgScore, unit: "/ 100"  },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your prompts..."
            style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", height: "38px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none" }} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          {["all", "chatgpt", "claude", "midjourney", "cursor"].map(m => (
            <button key={m} onClick={() => setFilterModel(m)} style={{
              padding: "4px 10px", borderRadius: "14px", fontSize: "11px", fontWeight: 500,
              border: filterModel === m ? `1px solid ${MODEL_COLORS[m] || "var(--amber)"}` : "1px solid var(--border)",
              background: filterModel === m ? `${MODEL_COLORS[m] || "#F5A623"}18` : "transparent",
              color: filterModel === m ? (MODEL_COLORS[m] || "var(--amber)") : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "var(--font-display)", transition: "all .15s",
            }}>{m === "all" ? "All models" : m}</button>
          ))}
          <div style={{ width: "1px", height: "20px", background: "var(--border)", alignSelf: "center" }} />
          {["lean", "structured"].map(m => (
            <button key={m} onClick={() => setFilterMode(filterMode === m ? "all" : m)} style={{
              padding: "4px 10px", borderRadius: "14px", fontSize: "11px", fontWeight: 500,
              border: filterMode === m
                ? `1px solid ${m === "lean" ? "var(--green)" : "var(--purple)"}`
                : "1px solid var(--border)",
              background: filterMode === m
                ? (m === "lean" ? "rgba(62,207,142,0.1)" : "rgba(155,127,244,0.1)")
                : "transparent",
              color: filterMode === m
                ? (m === "lean" ? "var(--green)" : "var(--purple)")
                : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "var(--font-display)", transition: "all .15s",
            }}>{m}</button>
          ))}
        </div>

        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "12px", fontFamily: "var(--font-display)" }}>
          {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: "80px", borderRadius: "14px", background: "linear-gradient(90deg,var(--bg-card) 25%,var(--bg-hover) 50%,var(--bg-card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: "28px", opacity: .3, marginBottom: "10px" }}>∅</div>
            <div style={{ fontSize: "13px" }}>
              {history.length === 0
                ? <span>No prompts yet. <a href="/" style={{ color: "var(--amber)", textDecoration: "none" }}>Optimize your first one →</a></span>
                : "No prompts match your filters"
              }
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map(item => (
              <HistoryCard key={item.id} item={item} onDelete={deletePrompt} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}