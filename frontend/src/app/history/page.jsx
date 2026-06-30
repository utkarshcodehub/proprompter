"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ── Mock data (replace with Supabase fetch in Phase 2) ────────
const MOCK_HISTORY = [
  {
    id: "h1", created_at: "2025-05-01T14:32:00Z",
    input: "write a linkedin post about my internship",
    mode: "lean", detected_model: "chatgpt", quality_score: 84,
    token_estimate_before: 18, token_estimate_after: 31, tokens_delta: 13,
    optimized_prompt: "Write a LinkedIn post about a software engineering internship. Open with one specific insight gained. Include 2 skills learned. End with a career-forward statement. 150–180 words.",
    explanation: "Stripped filler opener. Added structure and word count — the only genuine gaps.",
    changes_made: [
      { type: "stripped", detail: '"can you please write me a" — filler opener' },
      { type: "added", detail: "Word count and post structure" },
    ],
  },
  {
    id: "h2", created_at: "2025-05-01T11:15:00Z",
    input: "cool futuristic city at night",
    mode: "structured", detected_model: "midjourney", quality_score: 91,
    token_estimate_before: 6, token_estimate_after: 24, tokens_delta: 18,
    optimized_prompt: "neon-lit cyberpunk megacity, aerial view, volumetric fog, rim lighting, electric blue palette --ar 16:9 --v 6 --no blur, text, watermark",
    explanation: "Converted sentence to descriptor chain. Added mandatory MJ params and lighting.",
    changes_made: [
      { type: "restructured", detail: "Sentence → comma-separated descriptors" },
      { type: "added", detail: "Lighting, color palette, technical params" },
    ],
  },
  {
    id: "h3", created_at: "2025-04-30T18:45:00Z",
    input: "explain neural networks to me",
    mode: "lean", detected_model: "claude", quality_score: 88,
    token_estimate_before: 6, token_estimate_after: 18, tokens_delta: 12,
    optimized_prompt: "<task>Explain how neural networks learn — forward pass, loss, and backpropagation — using a programming analogy.</task>",
    explanation: "Wrapped in task tag and added analogy direction — the single highest-value addition for Claude.",
    changes_made: [
      { type: "restructured", detail: "Applied XML task tag structure" },
      { type: "added", detail: "Analogy direction closes the real gap" },
    ],
  },
  {
    id: "h4", created_at: "2025-04-30T10:20:00Z",
    input: "write a login function in python",
    mode: "structured", detected_model: "cursor", quality_score: 95,
    token_estimate_before: 9, token_estimate_after: 27, tokens_delta: 18,
    optimized_prompt: "Python 3.11, FastAPI. POST /auth/login — accepts {email, password}, returns JWT on success, raises HTTP 401 on failure. Supabase auth SDK.",
    explanation: "Added language, framework, and I/O contract — without these Cursor guesses wrong every time.",
    changes_made: [
      { type: "added", detail: "Language + framework context block" },
      { type: "specified", detail: "Full I/O contract and error handling" },
    ],
  },
  {
    id: "h5", created_at: "2025-04-29T16:30:00Z",
    input: "summarise this article in 3 bullet points",
    mode: "lean", detected_model: "chatgpt", quality_score: 97,
    token_estimate_before: 8, token_estimate_after: 8, tokens_delta: 0,
    optimized_prompt: "Summarise this article in 3 bullet points.",
    explanation: "Already precise. Minor punctuation cleanup only.",
    changes_made: [],
  },
  {
    id: "h6", created_at: "2025-04-29T09:10:00Z",
    input: "i need help making a landing page for my SaaS product",
    mode: "structured", detected_model: "chatgpt", quality_score: 79,
    token_estimate_before: 14, token_estimate_after: 67, tokens_delta: 53,
    optimized_prompt: "You are a senior UX copywriter specializing in SaaS landing pages.\n\nWrite copy for a SaaS landing page including: headline, subheadline, 3 feature bullets, and a CTA button label.\n\nProduct: [describe your product in 1 sentence]\nTarget user: [who is this for?]\nCore benefit: [what pain does it solve?]\n\nTone: direct, confident, benefit-led. Avoid buzzwords.",
    explanation: "Applied full structure but flagged missing product context with placeholder prompts.",
    changes_made: [
      { type: "added", detail: "Role assignment — SaaS copywriter persona" },
      { type: "specified", detail: "Defined required copy sections" },
      { type: "reframed", detail: "Inserted fill-in-the-blank context placeholders" },
    ],
  },
];

const MODEL_COLORS = {
  chatgpt: "#5B8FF9", claude: "#9B7FF4",
  midjourney: "#F5A623", cursor: "#3ECF8E", generic: "#888580",
};

// ── Components ────────────────────────────────────────────────

function SearchBar({ value, onChange }) {
  return (
    <div style={{
      position: "relative", flex: 1,
    }}>
      <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}
        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search your prompts..."
        style={{
          width: "100%", paddingLeft: "34px", paddingRight: "12px",
          height: "36px", background: "var(--bg-card)",
          border: "1px solid var(--border)", borderRadius: "9px",
          color: "var(--text-primary)", fontSize: "13px",
          fontFamily: "var(--font-body), DM Sans, sans-serif",
          outline: "none",
        }}
      />
    </div>
  );
}

function FilterPill({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: "16px",
      border: active ? `1px solid ${color || "var(--amber)"}` : "1px solid var(--border)",
      background: active ? `${(color || "#F5A623")}18` : "transparent",
      color: active ? (color || "var(--amber)") : "var(--text-secondary)",
      fontSize: "11px", fontWeight: 500, cursor: "pointer",
      fontFamily: "var(--font-display)",
      transition: "all .15s",
    }}>{label}</button>
  );
}

function HistoryCard({ item, onReuse }) {
  const modelColor = MODEL_COLORS[item.detected_model] || "#888580";
  const scoreColor = item.quality_score >= 90 ? "var(--green)" : item.quality_score >= 70 ? "var(--amber)" : "var(--red)";
  const deltaColor = item.tokens_delta <= 0 ? "var(--green)" : "var(--amber)";
  const deltaText  = item.tokens_delta === 0 ? "±0" : item.tokens_delta > 0 ? `+${item.tokens_delta}` : item.tokens_delta;
  const date = new Date(item.created_at);
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.optimized_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      overflow: "hidden",
      transition: "border-color .2s",
      cursor: "pointer",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Header row */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Model dot */}
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: modelColor, flexShrink: 0, marginTop: "6px",
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Raw input */}
          <div style={{
            fontSize: "13.5px", fontWeight: 500, color: "var(--text-primary)",
            fontFamily: "var(--font-display)", marginBottom: "4px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {item.input}
          </div>
          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "10px", padding: "1px 7px", borderRadius: "5px",
              border: `1px solid ${modelColor}40`, color: modelColor,
              fontFamily: "var(--font-display)", fontWeight: 600,
            }}>{item.detected_model}</span>
            <span style={{
              fontSize: "10px", padding: "1px 7px", borderRadius: "5px",
              background: item.mode === "lean" ? "rgba(62,207,142,0.1)" : "rgba(155,127,244,0.1)",
              color: item.mode === "lean" ? "var(--green)" : "var(--purple)",
              fontFamily: "var(--font-display)", fontWeight: 600,
            }}>{item.mode}</span>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{dateStr}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: deltaColor }}>{deltaText} tokens</div>
            <div style={{ fontSize: "10px", color: scoreColor, fontFamily: "var(--font-display)", fontWeight: 600 }}>{item.quality_score}/100</div>
          </div>
          <svg style={{ color: "var(--text-tertiary)", transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "12.5px",
            color: "var(--text-secondary)", lineHeight: 1.7,
            background: "var(--bg)", borderRadius: "10px",
            padding: "12px 14px", marginBottom: "12px",
            whiteSpace: "pre-wrap",
          }}>
            {item.optimized_prompt}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleCopy} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", borderRadius: "8px",
              background: copied ? "rgba(62,207,142,0.1)" : "var(--bg)",
              border: `1px solid ${copied ? "var(--green)" : "var(--border)"}`,
              color: copied ? "var(--green)" : "var(--text-secondary)",
              fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-display)",
              transition: "all .15s",
            }}>
              {copied ? "✓ Copied!" : "⎘ Copy"}
            </button>
            <button onClick={() => onReuse(item)} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", borderRadius: "8px",
              background: "var(--amber-glow)", border: "1px solid rgba(245,166,35,0.2)",
              color: "var(--amber)", fontSize: "12px", cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}>
              ↩ Re-optimize
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function HistoryPage() {
  const [search, setSearch]     = useState("");
  const [filterModel, setFilterModel] = useState("all");
  const [filterMode, setFilterMode]   = useState("all");

  const filtered = useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchSearch = !search || item.input.toLowerCase().includes(search.toLowerCase());
      const matchModel  = filterModel === "all" || item.detected_model === filterModel;
      const matchMode   = filterMode  === "all" || item.mode === filterMode;
      return matchSearch && matchModel && matchMode;
    });
  }, [search, filterModel, filterMode]);

  const stats = useMemo(() => ({
    total:    MOCK_HISTORY.length,
    saved:    MOCK_HISTORY.reduce((a, i) => a + Math.min(0, i.tokens_delta), 0),
    avgScore: Math.round(MOCK_HISTORY.reduce((a, i) => a + i.quality_score, 0) / MOCK_HISTORY.length),
  }), []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Navbar */}
      <nav style={{
        borderBottom: "1px solid var(--border)", padding: "0 2rem",
        height: "56px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0,
        background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: "26px", height: "26px", background: "var(--amber)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✦</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Pro<span style={{ color: "var(--amber)" }}>Prompter</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: "4px" }}>
          {[{ label: "Optimize", href: "/" }, { label: "History", href: "/history" }, { label: "Compare", href: "/compare" }, { label: "Collections", href: "/collections" }].map(nav => (
            <Link key={nav.href} href={nav.href} style={{
              padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
              color: nav.href === "/history" ? "var(--text-primary)" : "var(--text-secondary)",
              background: nav.href === "/history" ? "var(--bg-hover)" : "transparent",
              textDecoration: "none", fontFamily: "var(--font-display)",
            }}>{nav.label}</Link>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "6px" }}>
            Prompt History
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Every optimization you've run, searchable and reusable.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Total optimized", value: stats.total, unit: "prompts" },
            { label: "Tokens saved",    value: Math.abs(stats.saved), unit: "tokens net" },
            { label: "Avg quality",     value: `${stats.avgScore}`, unit: "/ 100" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "14px 16px",
            }}>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          <FilterPill label="All models" active={filterModel === "all"} onClick={() => setFilterModel("all")} />
          {Object.entries(MODEL_COLORS).filter(([k]) => k !== "generic").map(([k, c]) => (
            <FilterPill key={k} label={k} active={filterModel === k} color={c} onClick={() => setFilterModel(k)} />
          ))}
          <div style={{ width: "1px", height: "20px", background: "var(--border)", alignSelf: "center" }} />
          <FilterPill label="Lean" active={filterMode === "lean"} color="var(--green)" onClick={() => setFilterMode(filterMode === "lean" ? "all" : "lean")} />
          <FilterPill label="Structured" active={filterMode === "structured"} color="var(--purple)" onClick={() => setFilterMode(filterMode === "structured" ? "all" : "structured")} />
        </div>

        {/* Results count */}
        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "12px", fontFamily: "var(--font-display)" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-tertiary)" }}>
              <div style={{ fontSize: "28px", opacity: .3, marginBottom: "10px" }}>∅</div>
              <div style={{ fontSize: "13px" }}>No prompts match your filters</div>
            </div>
          ) : (
            filtered.map(item => (
              <HistoryCard key={item.id} item={item} onReuse={(item) => window.location.href = `/?input=${encodeURIComponent(item.input)}`} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}