"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const MODEL_COLORS = {
  chatgpt: "#5B8FF9", claude: "#9B7FF4",
  midjourney: "#F5A623", cursor: "#3ECF8E",
};

const ALL_TAGS = ["all", "writing", "career", "art", "scifi", "python", "fastapi", "auth", "education", "ml", "claude", "linkedin", "city"];

function SubmitModal({ onClose, onSubmit, user }) {
  const [title, setTitle]   = useState("");
  const [desc, setDesc]     = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel]   = useState("chatgpt");
  const [mode, setMode]     = useState("lean");
  const [tags, setTags]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !prompt.trim()) return;
    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: desc.trim(),
      prompt: prompt.trim(),
      model, mode,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "18px", padding: "28px", width: "520px",
        maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800, letterSpacing: "-.02em", marginBottom: "20px" }}>
          Share a template
        </h2>

        {[
          { label: "Title", value: title, set: setTitle, placeholder: "e.g. LinkedIn internship post" },
          { label: "Description (optional)", value: desc, set: setDesc, placeholder: "What does this prompt do?" },
          { label: "Tags (comma-separated)", value: tags, set: setTags, placeholder: "e.g. career, linkedin, writing" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>{f.label}</div>
            <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none" }} />
          </div>
        ))}

        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Prompt</div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Paste your optimized prompt here..." rows={4}
            style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "12.5px", fontFamily: "var(--font-mono)", outline: "none", resize: "vertical", lineHeight: 1.6 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Model</div>
            <select value={model} onChange={e => setModel(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}>
              {["chatgpt", "claude", "midjourney", "cursor"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Mode</div>
            <select value={mode} onChange={e => setMode(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}>
              <option value="lean">Lean</option>
              <option value="structured">Structured</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim() || !prompt.trim() || loading} style={{
            padding: "8px 20px", background: title.trim() && prompt.trim() ? "var(--amber)" : "var(--bg-hover)",
            border: "none", borderRadius: "9px",
            color: title.trim() && prompt.trim() ? "#000" : "var(--text-tertiary)",
            fontSize: "13px", fontWeight: 700, cursor: title.trim() && prompt.trim() ? "pointer" : "not-allowed",
            fontFamily: "var(--font-display)",
          }}>
            {loading ? "Sharing…" : "Share template"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, user, onUpvote, onClone, userUpvoted }) {
  const [copied, setCopied] = useState(false);
  const mc = MODEL_COLORS[template.model] || "#888";

  const handleCopy = () => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "14px", overflow: "hidden",
      transition: "border-color .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-light)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              {template.title}
            </div>
            {template.description && (
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{template.description}</div>
            )}
          </div>
          {/* Upvote */}
          <button onClick={() => onUpvote(template.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
            padding: "6px 10px", borderRadius: "8px",
            background: userUpvoted ? "rgba(245,166,35,0.1)" : "var(--bg)",
            border: `1px solid ${userUpvoted ? "var(--amber)" : "var(--border)"}`,
            color: userUpvoted ? "var(--amber)" : "var(--text-tertiary)",
            cursor: user ? "pointer" : "default",
            transition: "all .15s", flexShrink: 0, marginLeft: "12px",
          }}>
            <span style={{ fontSize: "14px" }}>▲</span>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-display)", fontWeight: 600 }}>{template.upvotes}</span>
          </button>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "12px" }}>
          <span style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-display)", border: `1px solid ${mc}40`, color: mc }}>{template.model}</span>
          <span style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: 600, fontFamily: "var(--font-display)", background: template.mode === "lean" ? "rgba(62,207,142,0.1)" : "rgba(155,127,244,0.1)", color: template.mode === "lean" ? "var(--green)" : "var(--purple)" }}>{template.mode}</span>
          {(template.tags || []).map(tag => (
            <span key={tag} style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "10px", color: "var(--text-tertiary)", background: "var(--bg)", border: "1px solid var(--border)" }}>{tag}</span>
          ))}
        </div>

        {/* Prompt preview */}
        <div style={{
          background: "var(--bg)", borderRadius: "9px", padding: "11px 13px",
          fontFamily: "var(--font-mono)", fontSize: "11.5px",
          color: "var(--text-secondary)", lineHeight: 1.65,
          maxHeight: "80px", overflow: "hidden",
          position: "relative",
        }}>
          {template.prompt}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30px", background: "linear-gradient(transparent, var(--bg))" }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
        <button onClick={handleCopy} style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "6px 12px", borderRadius: "7px",
          background: copied ? "rgba(62,207,142,0.1)" : "var(--bg)",
          border: `1px solid ${copied ? "var(--green)" : "var(--border)"}`,
          color: copied ? "var(--green)" : "var(--text-secondary)",
          fontSize: "11px", cursor: "pointer", fontFamily: "var(--font-display)", transition: "all .15s",
        }}>
          {copied ? "✓ Copied!" : "⎘ Copy"}
        </button>
        <Link href={`/?input=${encodeURIComponent(template.prompt)}&model=${template.model}&mode=${template.mode}`} style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "6px 12px", borderRadius: "7px",
          background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
          color: "var(--amber)", fontSize: "11px", textDecoration: "none",
          fontFamily: "var(--font-display)",
        }}>
          ✦ Use this
        </Link>
        {user && (
          <button onClick={() => onClone(template)} style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "6px 12px", borderRadius: "7px",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-secondary)", fontSize: "11px",
            cursor: "pointer", fontFamily: "var(--font-display)",
          }}>
            + Save to collection
          </button>
        )}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { collections, addPromptToCollection } = useCollections(user?.id);

  const [templates, setTemplates]     = useState([]);
  const [upvotedIds, setUpvotedIds]   = useState(new Set());
  const [loading, setLoading]         = useState(true);
  const [filterModel, setFilterModel] = useState("all");
  const [filterTag, setFilterTag]     = useState("all");
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [sortBy, setSortBy]           = useState("upvotes");

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase
      .from("community_templates")
      .select("*")
      .order(sortBy === "upvotes" ? "upvotes" : "created_at", { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  }, [sortBy]);

  const fetchUserUpvotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("template_upvotes")
      .select("template_id")
      .eq("user_id", user.id);
    setUpvotedIds(new Set((data || []).map(r => r.template_id)));
  }, [user]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { fetchUserUpvotes(); }, [fetchUserUpvotes]);

  const handleUpvote = async (templateId) => {
    if (!user) { window.location.href = "/login"; return; }
    const { data } = await supabase.rpc("handle_upvote", {
      p_template_id: templateId,
      p_user_id: user.id,
    });
    if (data) {
      setTemplates(prev => prev.map(t =>
        t.id === templateId ? { ...t, upvotes: data.upvotes } : t
      ));
      setUpvotedIds(prev => {
        const next = new Set(prev);
        data.upvoted ? next.add(templateId) : next.delete(templateId);
        return next;
      });
    }
  };

  const handleSubmit = async (templateData) => {
    if (!user) return;
    const { data } = await supabase
      .from("community_templates")
      .insert({ ...templateData, user_id: user.id })
      .select()
      .single();
    if (data) setTemplates(prev => [data, ...prev]);
  };

  const handleClone = async (template) => {
    if (!collections.length) {
      alert("Create a collection first from the Collections page.");
      return;
    }
    // Save prompt to history first, then add to first collection as demo
    // In full impl you'd show a collection picker modal
    alert(`Open your Collections page to save this prompt to a folder.`);
  };

  const filtered = templates.filter(t => {
    const matchModel  = filterModel === "all" || t.model === filterModel;
    const matchTag    = filterTag === "all" || (t.tags || []).includes(filterTag);
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.prompt.toLowerCase().includes(search.toLowerCase());
    return matchModel && matchTag && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      {showModal && <SubmitModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} user={user} />}

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>Community</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Browse, upvote, and use prompts shared by other ProPrompter users.</p>
          </div>
          <button onClick={() => user ? setShowModal(true) : window.location.href = "/login"} style={{
            padding: "9px 16px", background: "var(--amber)", border: "none",
            borderRadius: "10px", color: "#000", fontSize: "13px", fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-display)", flexShrink: 0,
          }}>
            + Share template
          </button>
        </div>

        {/* Search + sort */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
              style={{ width: "100%", paddingLeft: "30px", paddingRight: "12px", height: "36px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "13px", fontFamily: "var(--font-body), DM Sans, sans-serif", outline: "none" }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "0 12px", height: "36px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-secondary)", fontSize: "12px", outline: "none" }}>
            <option value="upvotes">Most upvoted</option>
            <option value="created_at">Newest first</option>
          </select>
        </div>

        {/* Model filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          {["all", "chatgpt", "claude", "midjourney", "cursor"].map(m => (
            <button key={m} onClick={() => setFilterModel(m)} style={{
              padding: "4px 11px", borderRadius: "14px", fontSize: "11px", fontWeight: 500,
              border: filterModel === m ? `1px solid ${MODEL_COLORS[m] || "var(--amber)"}` : "1px solid var(--border)",
              background: filterModel === m ? `${MODEL_COLORS[m] || "#F5A623"}18` : "transparent",
              color: filterModel === m ? (MODEL_COLORS[m] || "var(--amber)") : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "var(--font-display)", transition: "all .15s",
            }}>{m === "all" ? "All models" : m}</button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "14px", fontFamily: "var(--font-display)" }}>
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: "220px", borderRadius: "14px", background: "linear-gradient(90deg,var(--bg-card) 25%,var(--bg-hover) 50%,var(--bg-card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: "28px", opacity: .3, marginBottom: "10px" }}>∅</div>
            <div style={{ fontSize: "13px" }}>No templates match your filters</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {filtered.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                user={user}
                onUpvote={handleUpvote}
                onClone={handleClone}
                userUpvoted={upvotedIds.has(t.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}