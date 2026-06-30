"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import { useCollections } from "@/hooks/useCollections";
import Navbar from "@/components/Navbar";

const MODEL_COLORS = {
  chatgpt: "#5B8FF9", claude: "#9B7FF4",
  midjourney: "#F5A623", cursor: "#3ECF8E", auto: "#888580",
};

const EMOJIS = ["📁", "💼", "🎨", "⚡", "📚", "🚀", "🔧", "🌿", "💡", "🎯", "🛠️", "✨"];

function NewCollectionModal({ onClose, onCreate }) {
  const [name, setName]   = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [desc, setDesc]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate({ name: name.trim(), emoji, description: desc.trim() });
    setLoading(false);
    onClose();
  };

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
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, letterSpacing: "-.02em", marginBottom: "20px" }}>
          New collection
        </h2>

        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>Icon</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: "36px", height: "36px", borderRadius: "8px", fontSize: "18px",
                border: emoji === e ? "1px solid var(--amber)" : "1px solid var(--border)",
                background: emoji === e ? "rgba(245,166,35,0.1)" : "var(--bg)",
                cursor: "pointer",
              }}>{e}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Name</div>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="e.g. LinkedIn Content"
            style={{ width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none" }} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Description (optional)</div>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What kind of prompts go here?"
            style={{ width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={!name.trim() || loading} style={{
            padding: "8px 20px",
            background: name.trim() ? "var(--amber)" : "var(--bg-hover)",
            border: "none", borderRadius: "9px",
            color: name.trim() ? "#000" : "var(--text-tertiary)",
            fontSize: "13px", fontWeight: 700,
            cursor: name.trim() ? "pointer" : "not-allowed",
            fontFamily: "var(--font-display)",
          }}>
            {loading ? "Creating…" : "Create collection"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ col, isOpen, onToggle, onDelete, onRemovePrompt }) {
  const date = new Date(col.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const prompts = col.collection_prompts || [];
  const models  = [...new Set(prompts.map(p => p.prompt_history?.detected_model).filter(Boolean))];

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "16px", overflow: "hidden", transition: "border-color .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Header */}
      <div style={{ padding: "16px 18px", cursor: "pointer", display: "flex", gap: "14px", alignItems: "flex-start" }} onClick={onToggle}>
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
          {col.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{col.name}</div>
            <span style={{ padding: "1px 7px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)", fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
              {prompts.length}
            </span>
          </div>
          {col.description && <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "6px" }}>{col.description}</div>}
          <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Updated {date}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
          <svg style={{ color: "var(--text-tertiary)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          <div style={{ display: "flex", gap: "3px" }}>
            {models.map(m => <div key={m} style={{ width: "6px", height: "6px", borderRadius: "50%", background: MODEL_COLORS[m] || "#888" }} />)}
          </div>
        </div>
      </div>

      {/* Expanded prompts */}
      {isOpen && (
        <div style={{ borderTop: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
          {prompts.length === 0 ? (
            <div style={{ padding: "16px 18px", fontSize: "13px", color: "var(--text-tertiary)" }}>
              No prompts yet. <Link href="/" style={{ color: "var(--amber)", textDecoration: "none" }}>Optimize one →</Link>
            </div>
          ) : prompts.map((cp, i) => {
            const ph  = cp.prompt_history;
            const mc  = MODEL_COLORS[ph?.detected_model] || "#888";
            const sc  = (ph?.quality_score || 0) >= 90
              ? { bg: "rgba(62,207,142,0.1)", c: "#3ECF8E" }
              : { bg: "rgba(245,166,35,0.1)", c: "#F5A623" };
            return (
              <div key={cp.id} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 18px",
                borderBottom: i < prompts.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: mc, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ph?.input || "Untitled prompt"}
                </span>
                <span style={{ fontSize: "10px", color: mc, fontFamily: "var(--font-display)", fontWeight: 600, flexShrink: 0 }}>{ph?.detected_model}</span>
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "5px", background: sc.bg, color: sc.c, flexShrink: 0 }}>
                  {ph?.quality_score}
                </span>
                <Link href={`/?input=${encodeURIComponent(ph?.input || "")}`} style={{
                  padding: "3px 8px", borderRadius: "6px", background: "var(--bg)",
                  border: "1px solid var(--border)", color: "var(--text-tertiary)",
                  fontSize: "10px", fontFamily: "var(--font-display)", textDecoration: "none", flexShrink: 0,
                }}>Open ↗</Link>
                <button onClick={() => onRemovePrompt(col.id, cp.history_id)} style={{
                  padding: "3px 7px", borderRadius: "6px", background: "transparent",
                  border: "1px solid var(--border)", color: "var(--red)",
                  fontSize: "10px", cursor: "pointer", flexShrink: 0,
                }}>✕</button>
              </div>
            );
          })}

          {/* Footer actions */}
          <div style={{ padding: "12px 18px", borderTop: prompts.length > 0 ? "1px solid var(--border)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Add prompts by clicking "Save" on any optimization result.
            </span>
            <button onClick={() => onDelete(col.id)} style={{
              padding: "5px 12px", background: "transparent",
              border: "1px solid var(--border)", borderRadius: "8px",
              color: "var(--red)", fontSize: "11px", cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}>Delete collection</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { todayCount } = useHistory(user?.id);
  const { collections, loading, createCollection, deleteCollection, removePromptFromCollection } = useCollections(user?.id);

  const [openId, setOpenId]       = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (authLoading) return null;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <div style={{ maxWidth: "400px", margin: "8rem auto", textAlign: "center", padding: "0 1.5rem" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px", opacity: .4 }}>📁</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Sign in to use collections</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Organise your best prompts into folders and access them any time.</p>
          <Link href="/login" style={{ padding: "10px 24px", background: "var(--amber)", borderRadius: "10px", color: "#000", fontSize: "13px", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-display)" }}>Sign in</Link>
        </div>
      </div>
    );
  }

  const totalSaved = collections.reduce((a, c) => a + (c.collection_prompts?.length || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar todayCount={todayCount} />
      {showModal && <NewCollectionModal onClose={() => setShowModal(false)} onCreate={createCollection} />}

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>Collections</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Organise your best prompts into reusable folders.</p>
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

        {/* Stats pills */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            `${collections.length} collection${collections.length !== 1 ? "s" : ""}`,
            `${totalSaved} prompt${totalSaved !== 1 ? "s" : ""} saved`,
          ].map((s, i) => (
            <div key={i} style={{ padding: "6px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}>{s}</div>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: "90px", borderRadius: "16px", background: "linear-gradient(90deg,var(--bg-card) 25%,var(--bg-hover) 50%,var(--bg-card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {collections.map(col => (
              <CollectionCard
                key={col.id}
                col={col}
                isOpen={openId === col.id}
                onToggle={() => setOpenId(openId === col.id ? null : col.id)}
                onDelete={async (id) => {
                  if (!confirm("Delete this collection? Prompts inside will not be deleted.")) return;
                  await deleteCollection(id);
                  if (openId === id) setOpenId(null);
                }}
                onRemovePrompt={removePromptFromCollection}
              />
            ))}

            {/* Empty / create new */}
            <button onClick={() => setShowModal(true)} style={{
              padding: "20px", background: "transparent",
              border: "1px dashed var(--border-light)", borderRadius: "16px",
              color: "var(--text-tertiary)", fontSize: "13px", cursor: "pointer", width: "100%",
              fontFamily: "var(--font-display)", transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--amber)"; e.currentTarget.style.color = "var(--amber)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
            >
              {collections.length === 0
                ? "Create your first collection →"
                : "+ Create a new collection"
              }
            </button>
          </div>
        )}
      </main>
    </div>
  );
}