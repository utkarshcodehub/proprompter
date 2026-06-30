"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "@/hooks/useHistory";
import { useCollections } from "@/hooks/useCollections";
import Navbar from "@/components/Navbar";

const MODEL_COLORS = {
  chatgpt: "#5B8FF9", claude: "#9B7FF4",
  midjourney: "#F5A623", cursor: "#3ECF8E", generic: "#888580",
};

function StatCard({ label, value, unit, color, sub }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "14px", padding: "20px",
    }}>
      <div style={{
        fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)",
        fontFamily: "var(--font-display)", textTransform: "uppercase",
        letterSpacing: ".06em", marginBottom: "10px",
      }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "32px",
          fontWeight: 800, color: color || "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>{value}</span>
        {unit && <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{sub}</div>}
    </div>
  );
}

function ActivityBar({ history }) {
  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const counts = days.map(day =>
    history.filter(h => new Date(h.created_at).toDateString() === day).length
  );
  const max = Math.max(...counts, 1);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7; // 0 = Mon

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "14px", padding: "20px",
    }}>
      <div style={{
        fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)",
        fontFamily: "var(--font-display)", textTransform: "uppercase",
        letterSpacing: ".06em", marginBottom: "16px",
      }}>Activity — last 7 days</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "60px" }}>
        {counts.map((count, i) => {
          const height = Math.max((count / max) * 52, count > 0 ? 8 : 3);
          const isToday = i === todayIdx;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "100%", height: `${height}px`,
                background: count > 0
                  ? isToday ? "var(--amber)" : "rgba(245,166,35,0.4)"
                  : "var(--border)",
                borderRadius: "4px", transition: "height .3s ease",
                minHeight: "3px",
              }} />
              <span style={{ fontSize: "9px", color: isToday ? "var(--amber)" : "var(--text-tertiary)", fontFamily: "var(--font-display)" }}>
                {dayLabels[(todayIdx - 6 + i + 7) % 7]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModelBreakdown({ history }) {
  const counts = history.reduce((acc, h) => {
    acc[h.detected_model] = (acc[h.detected_model] || 0) + 1;
    return acc;
  }, {});
  const total  = history.length || 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "14px", padding: "20px",
    }}>
      <div style={{
        fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)",
        fontFamily: "var(--font-display)", textTransform: "uppercase",
        letterSpacing: ".06em", marginBottom: "14px",
      }}>Model breakdown</div>
      {sorted.length === 0 ? (
        <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>No data yet</div>
      ) : sorted.map(([model, count]) => (
        <div key={model} style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{
              fontSize: "12px", color: MODEL_COLORS[model] || "#888",
              fontFamily: "var(--font-display)", fontWeight: 600,
            }}>{model}</span>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              {count} ({Math.round((count / total) * 100)}%)
            </span>
          </div>
          <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(count / total) * 100}%`,
              background: MODEL_COLORS[model] || "#888",
              borderRadius: "2px", transition: "width .4s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentPrompts({ history }) {
  const recent = history.slice(0, 5);
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "14px", overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)",
          fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: ".06em",
        }}>Recent prompts</span>
        <Link href="/history" style={{ fontSize: "11px", color: "var(--amber)", textDecoration: "none", fontFamily: "var(--font-display)" }}>
          View all →
        </Link>
      </div>
      {recent.length === 0 ? (
        <div style={{ padding: "20px 18px", fontSize: "13px", color: "var(--text-tertiary)" }}>
          No prompts yet. <Link href="/" style={{ color: "var(--amber)", textDecoration: "none" }}>Optimize your first one →</Link>
        </div>
      ) : recent.map((h, i) => {
        const mc = MODEL_COLORS[h.detected_model] || "#888";
        const sc = h.quality_score >= 90 ? "var(--green)" : h.quality_score >= 70 ? "var(--amber)" : "var(--red)";
        const date = new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        return (
          <div key={h.id} style={{
            padding: "12px 18px",
            borderBottom: i < recent.length - 1 ? "1px solid var(--border)" : "none",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: mc, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "13px", color: "var(--text-primary)",
                fontFamily: "var(--font-display)", fontWeight: 500,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{h.input}</div>
              <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px" }}>{date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <span style={{
                fontSize: "10px", padding: "1px 7px", borderRadius: "5px",
                border: `1px solid ${mc}40`, color: mc,
                fontFamily: "var(--font-display)", fontWeight: 600,
              }}>{h.detected_model}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: sc, fontFamily: "var(--font-display)" }}>
                {h.quality_score}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { history, loading, todayCount } = useHistory(user?.id);
  const { collections } = useCollections(user?.id);

  const stats = useMemo(() => {
    if (!history.length) return { total: 0, avgScore: 0, tokensSaved: 0, favoriteModel: "—", streakDays: 0 };
    const avgScore    = Math.round(history.reduce((a, h) => a + (h.quality_score || 0), 0) / history.length);
    const tokensSaved = history.reduce((a, h) => a + Math.min(0, h.tokens_delta || 0), 0);
    const modelCounts = history.reduce((a, h) => { a[h.detected_model] = (a[h.detected_model] || 0) + 1; return a; }, {});
    const favoriteModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total: history.length, avgScore, tokensSaved: Math.abs(tokensSaved), favoriteModel };
  }, [history]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <div style={{ maxWidth: "400px", margin: "8rem auto", textAlign: "center", padding: "0 1.5rem" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px", opacity: .4 }}>📊</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Sign in to see your dashboard</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Track your optimization history, stats, and collections.</p>
          <Link href="/login" style={{
            padding: "10px 24px", background: "var(--amber)", borderRadius: "10px",
            color: "#000", fontSize: "13px", fontWeight: 700,
            textDecoration: "none", fontFamily: "var(--font-display)",
          }}>Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar todayCount={todayCount} />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Welcome back, {user.email?.split("@")[0]}.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          <StatCard label="Total optimized" value={stats.total} unit="prompts" color="var(--text-primary)" />
          <StatCard label="Avg quality" value={stats.avgScore} unit="/ 100" color="var(--amber)" sub="across all prompts" />
          <StatCard label="Tokens net saved" value={stats.tokensSaved} unit="tokens" color="var(--green)" sub="from stripping bloat" />
          <StatCard label="Favourite model" value={stats.favoriteModel} color={MODEL_COLORS[stats.favoriteModel] || "var(--text-primary)"} sub="most used" />
        </div>

        {/* Today's usage */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "14px", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "20px",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: "2px" }}>
              Today's usage
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {todayCount} of 10 free optimizations used
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "120px", height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(todayCount / 10) * 100}%`,
                background: todayCount >= 8 ? "var(--red)" : todayCount >= 5 ? "var(--amber)" : "var(--green)",
                borderRadius: "3px", transition: "width .4s",
              }} />
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              {Math.max(0, 10 - todayCount)} left
            </span>
          </div>
        </div>

        {/* Mid row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <ActivityBar history={history} />
          <ModelBreakdown history={history} />
        </div>

        {/* Collections summary */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "14px", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", gap: "24px" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{collections.length}</div>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Collections</div>
            </div>
            <div style={{ width: "1px", background: "var(--border)" }} />
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                {collections.reduce((a, c) => a + (c.collection_prompts?.length || 0), 0)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-display)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Saved prompts</div>
            </div>
          </div>
          <Link href="/collections" style={{
            padding: "7px 14px", background: "transparent",
            border: "1px solid var(--border)", borderRadius: "9px",
            color: "var(--text-secondary)", fontSize: "12px",
            textDecoration: "none", fontFamily: "var(--font-display)",
          }}>View collections →</Link>
        </div>

        {/* Recent prompts */}
        <RecentPrompts history={history} />

      </main>
    </div>
  );
}