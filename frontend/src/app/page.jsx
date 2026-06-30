"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";

const IconCopy  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconCheck = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSpark = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const IconZap   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconArrow = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const MODELS = [
  { id: "auto",       label: "Auto-detect",  color: "#888580" },
  { id: "chatgpt",    label: "ChatGPT",      color: "#5B8FF9" },
  { id: "claude",     label: "Claude",       color: "#9B7FF4" },
  { id: "midjourney", label: "Midjourney",   color: "#F5A623" },
  { id: "cursor",     label: "Cursor",       color: "#3ECF8E" },
];

const CHANGE_COLORS = {
  added:        { bg: "rgba(62,207,142,0.1)",  text: "#3ECF8E" },
  stripped:     { bg: "rgba(229,83,83,0.1)",   text: "#E55353" },
  restructured: { bg: "rgba(155,127,244,0.1)", text: "#9B7FF4" },
  specified:    { bg: "rgba(91,143,249,0.1)",  text: "#5B8FF9" },
  reframed:     { bg: "rgba(245,166,35,0.1)",  text: "#F5A623" },
};

function Navbar({ user, todayCount, signOut }) {
  const FREE_LIMIT = 10;
  const remaining  = Math.max(0, FREE_LIMIT - (todayCount || 0));

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)", padding: "0 2rem",
      height: "56px", display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0,
      background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)", zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "26px", height: "26px", background: "var(--amber)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSpark />
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Pro<span style={{ color: "var(--amber)" }}>Prompter</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {user && (
          <>
            {[
              { label: "History",     href: "/history"     },
              { label: "Compare",     href: "/compare"     },
              { label: "Collections", href: "/collections" },
            ].map(n => (
              <Link key={n.href} href={n.href} style={{
                padding: "5px 10px", borderRadius: "8px", fontSize: "12px",
                fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none",
                fontFamily: "var(--font-display)",
              }}>{n.label}</Link>
            ))}
            <div style={{ width: "1px", height: "18px", background: "var(--border)" }} />
          </>
        )}

        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 10px", background: "var(--bg-card)",
          border: "1px solid var(--border)", borderRadius: "8px",
          fontSize: "11px", color: "var(--text-secondary)",
        }}>
          <div style={{ width: "44px", height: "3px", background: "var(--border-light)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(remaining / FREE_LIMIT) * 100}%`,
              background: remaining > 3 ? "var(--green)" : "var(--amber)",
              borderRadius: "2px", transition: "width .4s",
            }} />
          </div>
          <span>{remaining}/{FREE_LIMIT} left</span>
        </div>

        {user ? (
          <button onClick={signOut} style={{
            padding: "5px 12px", background: "transparent",
            border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer",
            fontFamily: "var(--font-display)",
          }}>Sign out</button>
        ) : (
          <Link href="/login" style={{
            padding: "6px 14px", background: "var(--amber)", border: "none",
            borderRadius: "8px", color: "#000", fontSize: "12px",
            fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-display)",
          }}>Sign in</Link>
        )}
      </div>
    </nav>
  );
}

function ChangeTag({ type }) {
  const style = CHANGE_COLORS[type] || {};
  return (
    <span style={{
      padding: "2px 7px", borderRadius: "5px",
      background: style.bg, color: style.text,
      fontSize: "10px", fontWeight: 600,
      fontFamily: "var(--font-display)", textTransform: "uppercase",
      letterSpacing: "0.04em", flexShrink: 0,
    }}>{type}</span>
  );
}

function QualityScore({ score }) {
  const color  = score >= 90 ? "var(--green)" : score >= 70 ? "var(--amber)" : "var(--red)";
  const c      = 2 * Math.PI * 16;
  const offset = c - (score / 100) * c;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px" }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border-light)" strokeWidth="3"/>
        <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 20 20)" style={{ transition: "stroke-dashoffset .6s ease" }}/>
        <text x="20" y="24" textAnchor="middle" fill={color}
          style={{ fontSize: "11px", fontFamily: "var(--font-display)", fontWeight: 700 }}>{score}</text>
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

function ResultsPanel({ result, onSave, saveState }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimized_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--amber)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Optimized prompt
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-tertiary)", padding: "2px 8px", background: "var(--bg)", borderRadius: "5px", border: "1px solid var(--border)" }}>
              {result.detected_model}
            </span>
            <button onClick={onSave} style={{
              padding: "4px 10px", borderRadius: "6px",
              background: saveState === "saved" ? "rgba(62,207,142,0.1)" : "transparent",
              border: `1px solid ${saveState === "saved" ? "var(--green)" : "var(--border)"}`,
              color: saveState === "saved" ? "var(--green)" : "var(--text-tertiary)",
              fontSize: "11px", cursor: "pointer", transition: "all .15s",
            }}>
              {saveState === "saving" ? "…" : saveState === "saved" ? "✓ Saved" : "Save"}
            </button>
            <button onClick={handleCopy} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 10px", borderRadius: "6px",
              background: copied ? "rgba(62,207,142,0.1)" : "var(--bg)",
              border: `1px solid ${copied ? "var(--green)" : "var(--border)"}`,
              color: copied ? "var(--green)" : "var(--text-secondary)",
              fontSize: "11px", fontWeight: 500, cursor: "pointer", transition: "all .15s",
            }}>
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <pre style={{ padding: "16px", fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1.75, color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
          {result.optimized_prompt}
        </pre>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", color: "var(--text-secondary)" }}>{result.token_estimate_before}</div>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>input</div>
          </div>
          <div style={{ color: "var(--text-tertiary)" }}><IconArrow /></div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", color: "var(--text-primary)" }}>{result.token_estimate_after}</div>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>optimized</div>
          </div>
          <div style={{
            padding: "3px 8px", borderRadius: "6px",
            background: result.tokens_delta <= 0 ? "rgba(62,207,142,0.1)" : "rgba(245,166,35,0.1)",
            color: result.tokens_delta <= 0 ? "var(--green)" : "var(--amber)",
            fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500,
          }}>
            {result.tokens_delta > 0 ? `+${result.tokens_delta}` : result.tokens_delta}
          </div>
        </div>
        <QualityScore score={result.quality_score} />
        <div style={{ flex: 1, minWidth: "180px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "var(--font-display)", fontWeight: 600 }}>Why it's better</div>
          {result.explanation}
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Changes made
        </div>
        {result.changes_made.length === 0 ? (
          <div style={{ padding: "12px 16px", fontSize: "12.5px", color: "var(--text-tertiary)" }}>Already precise — minor cleanup only.</div>
        ) : result.changes_made.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 16px", borderBottom: i < result.changes_made.length - 1 ? "1px solid var(--border)" : "none" }}>
            <ChangeTag type={c.type} />
            <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.detail}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "10px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6, display: "flex", gap: "8px" }}>
        <span style={{ color: "var(--amber)", flexShrink: 0 }}>↔</span>
        <div>
          <span style={{ color: "var(--amber)", fontWeight: 600, marginRight: "6px" }}>Other mode:</span>
          {result.mode_insight}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { savePrompt, todayCount } = useHistory(user?.id);

  const [input, setInput]         = useState("");
  const [model, setModel]         = useState("auto");
  const [mode, setMode]           = useState("lean");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [saveState, setSaveState] = useState("idle");

  const handleOptimize = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setSaveState("idle");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), mode, model }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(res.status === 429
          ? "Daily limit reached. Sign in to get more, or upgrade to Pro."
          : data?.detail?.message || "Something went wrong.");
        return;
      }

      const data = await res.json();
      setResult(data);

      if (user) {
        setSaveState("saving");
        await savePrompt(data, input.trim());
        setSaveState("saved");
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!result || saveState === "saved") return;
    if (!user) { window.location.href = "/login"; return; }
    setSaveState("saving");
    await savePrompt(result, input.trim());
    setSaveState("saved");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar user={user} todayCount={todayCount} signOut={signOut} />

      <div style={{ position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse,rgba(245,166,35,0.07) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 1.5rem 6rem", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "12px" }}>
            Write better prompts,<br /><span style={{ color: "var(--amber)" }}>spend fewer tokens.</span>
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "420px", margin: "0 auto" }}>
            Paste your vague idea. Get a lean, structured prompt optimized for your AI tool — with an explanation of every change.
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", marginBottom: "10px" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => (e.metaKey || e.ctrlKey) && e.key === "Enter" && handleOptimize()}
            placeholder="write a blog post about AI trends..."
            rows={5}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", padding: "18px 20px", fontSize: "14.5px", color: "var(--text-primary)", fontFamily: "var(--font-body), DM Sans, sans-serif", lineHeight: 1.7, resize: "vertical", minHeight: "130px" }}
          />
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => setModel(m.id)} style={{
                    padding: "4px 10px", borderRadius: "16px",
                    border: model === m.id ? `1px solid ${m.color}` : "1px solid var(--border)",
                    background: model === m.id ? `${m.color}18` : "transparent",
                    color: model === m.id ? m.color : "var(--text-secondary)",
                    fontSize: "11px", fontWeight: 500, cursor: "pointer",
                    fontFamily: "var(--font-display)", transition: "all .15s",
                  }}>{m.label}</button>
                ))}
              </div>
              <div style={{ width: "1px", height: "18px", background: "var(--border)" }} />
              <div style={{ display: "flex", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", padding: "3px", gap: "2px" }}>
                {["lean", "structured"].map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    padding: "4px 12px", borderRadius: "6px", border: "none",
                    background: mode === m ? (m === "lean" ? "var(--green)" : "var(--purple)") : "transparent",
                    color: mode === m ? "#000" : "var(--text-secondary)",
                    fontSize: "11px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "var(--font-display)", textTransform: "capitalize", transition: "all .18s",
                  }}>
                    {m === "lean" ? <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><IconZap />{m}</span> : m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>⌘↵</span>
              <button onClick={handleOptimize} disabled={!input.trim() || loading} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 18px",
                background: input.trim() && !loading ? "var(--amber)" : "var(--bg-hover)",
                border: "none", borderRadius: "9px",
                color: input.trim() && !loading ? "#000" : "var(--text-tertiary)",
                fontSize: "13px", fontWeight: 700,
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                fontFamily: "var(--font-display)", transition: "all .15s",
              }}>
                {loading ? "Optimizing…" : <><IconSpark /> Optimize</>}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "28px", fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center" }}>
          {mode === "lean" ? "Lean mode — minimum tokens, maximum clarity." : "Structured mode — full framework applied, best for teams."}
          {!user && !authLoading && (
            <span> <Link href="/login" style={{ color: "var(--amber)", textDecoration: "none" }}>Sign in</Link> to save history.</span>
          )}
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(229,83,83,0.08)", border: "1px solid rgba(229,83,83,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "20px" }}>{error}</div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[160, 60, 120].map((h, i) => (
              <div key={i} style={{ height: `${h}px`, borderRadius: "14px", background: "linear-gradient(90deg,var(--bg-card) 25%,var(--bg-hover) 50%,var(--bg-card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
          </div>
        )}

        {result && !loading && (
          <ResultsPanel result={result} onSave={handleManualSave} saveState={saveState} />
        )}

        {!result && !loading && !error && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: .3 }}>⌥</div>
            <div>Your optimized prompt will appear here</div>
          </div>
        )}
      </main>
    </div>
  );
}