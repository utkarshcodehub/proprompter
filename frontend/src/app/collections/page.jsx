"use client";

import { useState } from "react";
import Link from "next/link";

const MOCK_COLLECTIONS = [
  {
    id: "c1", name: "LinkedIn Content", emoji: "💼",
    description: "Post templates for career updates, project launches, and internship stories.",
    count: 8, lastUpdated: "2025-05-01T14:32:00Z",
    prompts: [
      { id: "p1", input: "write a linkedin post about my internship", model: "chatgpt", quality_score: 84 },
      { id: "p2", input: "linkedin post about new job announcement", model: "chatgpt", quality_score: 91 },
      { id: "p3", input: "sharing my open source project on linkedin", model: "chatgpt", quality_score: 88 },
    ],
  },
  {
    id: "c2", name: "Midjourney Art", emoji: "🎨",
    description: "Visual prompts for architecture, characters, and environment concepts.",
    count: 12, lastUpdated: "2025-04-30T18:00:00Z",
    prompts: [
      { id: "p4", input: "cool futuristic city at night", model: "midjourney", quality_score: 91 },
      { id: "p5", input: "portrait of a cyberpunk character", model: "midjourney", quality_score: 89 },
      { id: "p6", input: "abandoned greenhouse in foggy morning", model: "midjourney", quality_score: 94 },
    ],
  },
  {
    id: "c3", name: "FastAPI Backend", emoji: "⚡",
    description: "Code generation prompts for auth, routes, and database logic.",
    count: 6, lastUpdated: "2025-04-29T10:15:00Z",
    prompts: [
      { id: "p7", input: "write a login function in python", model: "cursor", quality_score: 95 },
      { id: "p8", input: "create a rate limiter middleware in fastapi", model: "cursor", quality_score: 92 },
    ],
  },
  {
    id: "c4", name: "Study Notes", emoji: "📚",
    description: "Explain-it-to-me prompts for DSA, OS, and ML concepts.",
    count: 15, lastUpdated: "2025-04-28T09:00:00Z",
    prompts: [
      { id: "p9", input: "explain neural networks to me", model: "claude", quality_score: 88 },
      { id: "p10", input: "explain time complexity with examples", model: "claude", quality_score: 90 },
    ],
  },
];

const MODEL_COLORS = { chatgpt: "#5B8FF9", claude: "#9B7FF4", midjourney: "#F5A623", cursor: "#3ECF8E", auto: "#888580" };

function Navbar() {
  return (
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
            color: nav.href === "/collections" ? "var(--text-primary)" : "var(--text-secondary)",
            background: nav.href === "/collections" ? "var(--bg-hover)" : "transparent",
            textDecoration: "none", fontFamily: "var(--font-display)",
          }}>{nav.label}</Link>
        ))}
      </div>
    </nav>
  );
}

function CollectionCard({ col, isOpen, onToggle, onAddPrompt }) {
  const date = new Date(col.lastUpdated);
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const [newPromptInput, setNewPromptInput] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "16px", overflow: "hidden",
      transition: "border-color .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Collection header */}
      <div
        style={{ padding: "16px 18px", cursor: "pointer", display: "flex", gap: "14px", alignItems: "flex-start" }}
        onClick={onToggle}
      >
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: "var(--bg)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", flexShrink: 0,
        }}>{col.emoji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{col.name}</div>
            <span style={{
              padding: "1px 7px", borderRadius: "10px",
              background: "var(--bg)", border: "1px solid var(--border)",
              fontSize: "10px", color: "var(--text-tertiary)",
              fontFamily: "var(--font-display)", fontWeight: 600,
            }}>{col.count}</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "6px" }}>{col.description}</div>
          <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Updated {dateStr}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
          <svg style={{ color: "var(--text-tertiary)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {/* Model dots */}
          <div style={{ display: "flex", gap: "3px" }}>
            {[...new Set(col.prompts.map(p => p.model))].map(m => (
              <div key={m} style={{ width: "6px", height: "6px", borderRadius: "50%", background: MODEL_COLORS[m] || "#888" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Expanded prompts */}
      {isOpen && (
        <div style={{ borderTop: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
          {col.prompts.map((p, i) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 18px",
              borderBottom: i < col.prompts.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: MODEL_COLORS[p.model], flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.input}</span>
              <span style={{ fontSize: "10px", color: MODEL_COLORS[p.model], fontFamily: "var(--font-display)", fontWeight: 600, flexShrink: 0 }}>{p.model}</span>
              <span style={{
                fontSize: "10px", padding: "1px 6px", borderRadius: "5px",
                background: p.quality_score >= 90 ? "rgba(62,207,142,0.1)" : "rgba(245,166,35,0.1)",
                color: p.quality_score >= 90 ? "var(--green)" : "var(--amber)",
                flexShrink: 0,
              }}>{p.quality_score}</span>
              <Link href={`/?input=${encodeURIComponent(p.input)}`} style={{
                padding: "3px 8px", borderRadius: "6px",
                background: "var(--bg)", border: "1px solid var(--border)",
                color: "var(--text-tertiary)", fontSize: "10px",
                fontFamily: "var(--font-display)", textDecoration: "none",
                flexShrink: 0,
              }}>Open ↗</Link>
            </div>
          ))}

          {/* Add to collection */}
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            {!showAddInput ? (
              <button onClick={() => setShowAddInput(true)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "8px",
                background: "transparent", border: "1px dashed var(--border-light)",
                color: "var(--text-tertiary)", fontSize: "12px", cursor: "pointer",
                fontFamily: "var(--font-display)", width: "100%", justifyContent: "center",
                transition: "all .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--amber)"; e.currentTarget.style.color = "var(--amber)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
              >
                + Add prompt to collection
              </button>
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  autoFocus
                  value={newPromptInput}
                  onChange={e => setNewPromptInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { onAddPrompt(col.id, newPromptInput); setNewPromptInput(""); setShowAddInput(false); } if (e.key === "Escape") setShowAddInput(false); }}
                  placeholder="Type a prompt or paste from history..."
                  style={{
                    flex: 1, padding: "7px 12px", background: "var(--bg)",
                    border: "1px solid var(--border)", borderRadius: "8px",
                    color: "var(--text-primary)", fontSize: "12px",
                    fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none",
                  }}
                />
                <button onClick={() => { onAddPrompt(col.id, newPromptInput); setNewPromptInput(""); setShowAddInput(false); }} style={{
                  padding: "7px 14px", background: "var(--amber)", border: "none",
                  borderRadius: "8px", color: "#000", fontSize: "12px", fontWeight: 700,
                  cursor: "pointer", fontFamily: "var(--font-display)",
                }}>Add</button>
                <button onClick={() => setShowAddInput(false)} style={{
                  padding: "7px 12px", background: "transparent", border: "1px solid var(--border)",
                  borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px",
                  cursor: "pointer",
                }}>✕</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewCollectionModal({ onClose, onCreate }) {
  const [name, setName]   = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [desc, setDesc]   = useState("");
  const EMOJIS = ["📁", "💼", "🎨", "⚡", "📚", "🚀", "🔧", "🌿", "💡", "🎯", "🛠️", "✨"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "18px", padding: "24px", width: "400px", maxWidth: "90vw",
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "20px" }}>New collection</h2>

        {/* Emoji picker */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>Icon</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: "36px", height: "36px", borderRadius: "8px", fontSize: "18px",
                border: emoji === e ? "1px solid var(--amber)" : "1px solid var(--border)",
                background: emoji === e ? "var(--amber-glow)" : "var(--bg)",
                cursor: "pointer",
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Name</div>
          <input
            autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. LinkedIn Content"
            style={{
              width: "100%", padding: "9px 12px", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: "9px",
              color: "var(--text-primary)", fontSize: "13px",
              fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none",
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Description (optional)</div>
          <input
            value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="What kind of prompts go here?"
            style={{
              width: "100%", padding: "9px 12px", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: "9px",
              color: "var(--text-primary)", fontSize: "13px",
              fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "8px 16px", background: "transparent", border: "1px solid var(--border)",
            borderRadius: "9px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => { if (name.trim()) { onCreate({ name, emoji, description: desc }); onClose(); } }} style={{
            padding: "8px 20px", background: name.trim() ? "var(--amber)" : "var(--bg-hover)",
            border: "none", borderRadius: "9px",
            color: name.trim() ? "#000" : "var(--text-tertiary)",
            fontSize: "13px", fontWeight: 700,
            cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "var(--font-display)",
          }}>Create collection</button>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);
  const [openId, setOpenId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (data) => {
    setCollections(prev => [...prev, {
      id: `c${Date.now()}`, ...data,
      count: 0, lastUpdated: new Date().toISOString(), prompts: [],
    }]);
  };

  const handleAddPrompt = (collectionId, inputText) => {
    if (!inputText.trim()) return;
    setCollections(prev => prev.map(c =>
      c.id !== collectionId ? c : {
        ...c, count: c.count + 1,
        prompts: [...c.prompts, { id: `p${Date.now()}`, input: inputText, model: "auto", quality_score: 0 }],
      }
    ));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      {showModal && <NewCollectionModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "6px" }}>Collections</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Organize your best prompts into reusable folders.</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "9px 16px", background: "var(--amber)", border: "none",
            borderRadius: "10px", color: "#000", fontSize: "13px", fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0,
          }}>
            + New collection
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { label: `${collections.length} collections` },
            { label: `${collections.reduce((a, c) => a + c.count, 0)} prompts saved` },
            { label: `${[...new Set(collections.flatMap(c => c.prompts.map(p => p.model)))].length} models covered` },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "6px 12px", background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "8px",
              fontSize: "12px", color: "var(--text-secondary)",
              fontFamily: "var(--font-display)",
            }}>{s.label}</div>
          ))}
        </div>

        {/* Collections grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {collections.map(col => (
            <CollectionCard
              key={col.id}
              col={col}
              isOpen={openId === col.id}
              onToggle={() => setOpenId(openId === col.id ? null : col.id)}
              onAddPrompt={handleAddPrompt}
            />
          ))}

          {/* Empty new collection card */}
          <button onClick={() => setShowModal(true)} style={{
            padding: "20px", background: "transparent",
            border: "1px dashed var(--border-light)", borderRadius: "16px",
            color: "var(--text-tertiary)", fontSize: "13px",
            cursor: "pointer", width: "100%",
            fontFamily: "var(--font-display)",
            transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--amber)"; e.currentTarget.style.color = "var(--amber)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            + Create a new collection
          </button>
        </div>
      </main>
    </div>
  );
}