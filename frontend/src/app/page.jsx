"use client";

import { useState, useRef } from "react";

// ── Icons (inline SVG — no extra dep) ────────────────────────
const IconCopy    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSpark   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const IconZap     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconArrow   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

// ── Data ──────────────────────────────────────────────────────
const MODELS = [
  { id: "auto",       label: "Auto-detect", color: "#888580" },
  { id: "chatgpt",    label: "ChatGPT",     color: "#5B8FF9" },
  { id: "claude",     label: "Claude",      color: "#9B7FF4" },
  { id: "midjourney", label: "Midjourney",  color: "#F5A623" },
  { id: "cursor",     label: "Cursor",      color: "#3ECF8E" },
];

const CHANGE_COLORS = {
  added:        { bg: "rgba(62,207,142,0.1)",  text: "#3ECF8E" },
  stripped:     { bg: "rgba(229,83,83,0.1)",   text: "#E55353" },
  restructured: { bg: "rgba(155,127,244,0.1)", text: "#9B7FF4" },
  specified:    { bg: "rgba(91,143,249,0.1)",  text: "#5B8FF9" },
  reframed:     { bg: "rgba(245,166,35,0.1)",  text: "#F5A623" },
};

const PLACEHOLDERS = [
  "write a blog post about AI...",
  "explain neural networks to me...",
  "cool futuristic city at night...",
  "write a login function in python...",
  "make a linkedin post about my internship...",
];

// ── Sub-components ────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      padding: "0 2rem",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      background: "rgba(8,8,8,0.85)",
      backdropFilter: "blur(12px)",
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "26px", height: "26px",
          background: "var(--amber)",
          borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconSpark />
        </div>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          Pro<span style={{ color: "var(--amber)" }}>Prompter</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <UsagePill endpoint="optimize" limit={10} />
        <button style={{
          padding: "6px 14px",
          background: "var(--amber)",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-display)",
        }}>
          Go Pro
        </button>
      </div>
    </nav>
  );
}

function UsagePill({ endpoint, limit }) {
  // Reads from /api/v1/usage in Phase 2 — hardcoded for now
  const used = 3;
  const remaining = limit - used;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "5px 10px",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "11px",
      color: "var(--text-secondary)",
    }}>
      <div style={{
        width: "48px", height: "3px",
        background: "var(--border-light)",
        borderRadius: "2px", overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${(remaining / limit) * 100}%`,
          background: remaining > 3 ? "var(--green)" : "var(--amber)",
          borderRadius: "2px",
          transition: "width 0.4s ease",
        }} />
      </div>
      <span>{remaining}/{limit} left</span>
    </div>
  );
}

function ModelSelector({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {MODELS.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          style={{
            padding: "5px 12px",
            borderRadius: "20px",
            border: selected === m.id
              ? `1px solid ${m.color}`
              : "1px solid var(--border)",
            background: selected === m.id
              ? `${m.color}18`
              : "transparent",
            color: selected === m.id ? m.color : "var(--text-secondary)",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "var(--font-display)",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div style={{
      display: "flex",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "3px",
      gap: "2px",
    }}>
      {["lean", "structured"].map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: "5px 14px",
            borderRadius: "7px",
            border: "none",
            background: mode === m ? (m === "lean" ? "var(--green)" : "var(--purple)") : "transparent",
            color: mode === m ? "#000" : "var(--text-secondary)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.18s ease",
            fontFamily: "var(--font-display)",
            textTransform: "capitalize",
          }}
        >
          {m === "lean" ? <span style={{display:"flex",alignItems:"center",gap:"4px"}}><IconZap />{m}</span> : m}
        </button>
      ))}
    </div>
  );
}

function TokenDelta({ before, after, delta }) {
  const saved = delta < 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "10px 14px",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      fontSize: "12px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-code)", fontSize: "15px", color: "var(--text-secondary)" }}>{before}</div>
        <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>input</div>
      </div>
      <div style={{ color: "var(--text-tertiary)" }}><IconArrow /></div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-code)", fontSize: "15px", color: "var(--text-primary)" }}>{after}</div>
        <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>optimized</div>
      </div>
      <div style={{
        padding: "3px 8px",
        borderRadius: "6px",
        background: saved ? "rgba(62,207,142,0.1)" : "rgba(245,166,35,0.1)",
        color: saved ? "var(--green)" : "var(--amber)",
        fontFamily: "var(--font-code)",
        fontSize: "12px",
        fontWeight: 500,
      }}>
        {delta > 0 ? `+${delta}` : delta}
      </div>
    </div>
  );
}

function QualityScore({ score }) {
  const color = score >= 90 ? "var(--green)" : score >= 70 ? "var(--amber)" : "var(--red)";
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 14px",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border-light)" strokeWidth="3"/>
        <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="20" y="24" textAnchor="middle" fill={color}
          style={{ fontSize: "11px", fontFamily: "var(--font-display)", fontWeight: 700 }}>
          {score}
        </text>
      </svg>
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
          {score >= 90 ? "Excellent" : score >= 80 ? "Great" : score >= 70 ? "Good" : "Needs work"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>Quality score</div>
      </div>
    </div>
  );
}

function ChangeTag({ type }) {
  const style = CHANGE_COLORS[type] || { bg: "var(--bg-hover)", text: "var(--text-secondary)" };
  return (
    <span style={{
      padding: "2px 7px",
      borderRadius: "5px",
      background: style.bg,
      color: style.text,
      fontSize: "10px",
      fontWeight: 600,
      fontFamily: "var(--font-display)",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      flexShrink: 0,
    }}>{type}</span>
  );
}

function ResultsPanel({ result }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimized_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="anim-fadeup" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Optimized prompt */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "14px",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "var(--amber)",
            fontFamily: "var(--font-display)",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Optimized prompt
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "11px", color: "var(--text-tertiary)",
              padding: "2px 8px",
              background: "var(--bg)",
              borderRadius: "5px",
              border: "1px solid var(--border)",
            }}>
              {result.detected_model}
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px",
                background: copied ? "rgba(62,207,142,0.12)" : "var(--bg)",
                border: `1px solid ${copied ? "var(--green)" : "var(--border)"}`,
                borderRadius: "7px",
                color: copied ? "var(--green)" : "var(--text-secondary)",
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <pre style={{
          padding: "16px",
          fontFamily: "var(--font-code)",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "var(--text-primary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
        }}>
          {result.optimized_prompt}
        </pre>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <TokenDelta
          before={result.token_estimate_before}
          after={result.token_estimate_after}
          delta={result.tokens_delta}
        />
        <QualityScore score={result.quality_score} />
        <div style={{
          flex: 1, minWidth: "200px",
          padding: "10px 14px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          fontSize: "12.5px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-display)", fontWeight: 600 }}>Why it's better</div>
          {result.explanation}
        </div>
      </div>

      {/* Changes made */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          fontSize: "11px",
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          Changes made
        </div>
        {result.changes_made.map((c, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "10px 16px",
            borderBottom: i < result.changes_made.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <ChangeTag type={c.type} />
            <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {c.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Mode insight */}
      <div style={{
        padding: "12px 16px",
        background: "var(--amber-glow-sm)",
        border: "1px solid rgba(245,166,35,0.15)",
        borderRadius: "10px",
        fontSize: "12.5px",
        color: "var(--text-secondary)",
        lineHeight: 1.6,
        display: "flex", gap: "8px", alignItems: "flex-start",
      }}>
        <span style={{ color: "var(--amber)", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>↔</span>
        <div>
          <span style={{ color: "var(--amber)", fontWeight: 600, marginRight: "6px" }}>Other mode:</span>
          {result.mode_insight}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="anim-fadein">
      <div className="shimmer" style={{ height: "160px", borderRadius: "14px" }} />
      <div style={{ display: "flex", gap: "10px" }}>
        <div className="shimmer" style={{ height: "60px", borderRadius: "10px", flex: 1 }} />
        <div className="shimmer" style={{ height: "60px", borderRadius: "10px", width: "100px" }} />
        <div className="shimmer" style={{ height: "60px", borderRadius: "10px", flex: 1 }} />
      </div>
      <div className="shimmer" style={{ height: "120px", borderRadius: "14px" }} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function OptimizerPage() {
  const [input, setInput]       = useState("");
  const [model, setModel]       = useState("auto");
  const [mode, setMode]         = useState("lean");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const placeholder             = PLACEHOLDERS[0];
  const textareaRef             = useRef(null);

  const handleOptimize = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), mode, model }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429) {
          setError("Daily limit reached. Upgrade to Pro for unlimited optimizations.");
        } else {
          setError(data?.detail?.message || "Something went wrong. Try again.");
        }
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleOptimize();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "-200px", left: "50%",
        transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse at center, rgba(245,166,35,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <main style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "3rem 1.5rem 6rem",
        position: "relative", zIndex: 1,
      }}>

        {/* Hero heading */}
        <div className="anim-fadeup" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}>
            Write better prompts,<br />
            <span style={{ color: "var(--amber)" }}>spend fewer tokens.</span>
          </h1>
          <p style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "440px",
            margin: "0 auto",
          }}>
            Paste your vague idea. Get a lean, structured prompt optimized for your AI tool — with an explanation of every change.
          </p>
        </div>

        {/* Input card */}
        <div className="anim-fadeup delay-1" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "12px",
          transition: "border-color 0.2s",
        }}
          onFocus={() => {}}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={5}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "18px 20px",
              fontSize: "14.5px",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body), DM Sans, sans-serif",
              lineHeight: 1.7,
              resize: "vertical",
              minHeight: "130px",
            }}
          />

          {/* Toolbar */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <ModelSelector selected={model} onChange={setModel} />
              <div style={{ width: "1px", height: "20px", background: "var(--border)" }} />
              <ModeToggle mode={mode} onChange={setMode} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                ⌘↵
              </span>
              <button
                onClick={handleOptimize}
                disabled={!input.trim() || loading}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "8px 18px",
                  background: input.trim() && !loading ? "var(--amber)" : "var(--bg-hover)",
                  border: "none",
                  borderRadius: "9px",
                  color: input.trim() && !loading ? "#000" : "var(--text-tertiary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-display)",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                {loading ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Optimizing…
                  </>
                ) : (
                  <><IconSpark /> Optimize</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mode hint */}
        <div className="anim-fadeup delay-2" style={{
          marginBottom: "28px",
          fontSize: "12px",
          color: "var(--text-tertiary)",
          textAlign: "center",
        }}>
          {mode === "lean"
            ? "Lean mode — minimum tokens, maximum clarity. Best for personal use."
            : "Structured mode — full framework applied. Best for teams and templates."}
        </div>

        {/* Error */}
        {error && (
          <div className="anim-fadeup" style={{
            padding: "12px 16px",
            background: "rgba(229,83,83,0.08)",
            border: "1px solid rgba(229,83,83,0.2)",
            borderRadius: "10px",
            color: "var(--red)",
            fontSize: "13px",
            marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {loading && <LoadingSkeleton />}
        {result && !loading && <ResultsPanel result={result} />}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="anim-fadeup delay-3" style={{
            textAlign: "center",
            padding: "3rem 0",
            color: "var(--text-tertiary)",
            fontSize: "13px",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>⌥</div>
            <div>Your optimized prompt will appear here</div>
          </div>
        )}

      </main>
    </div>
  );
}
