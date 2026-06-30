"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const IconSpark = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const NAV_LINKS = [
  { label: "Optimize",    href: "/",            public: true  },
  { label: "Community",   href: "/community",   public: true  },
  { label: "Dashboard",   href: "/dashboard",   public: false },
  { label: "History",     href: "/history",     public: false },
  { label: "Compare",     href: "/compare",     public: false },
  { label: "Collections", href: "/collections", public: false },
];

export default function Navbar({ todayCount = 0 }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const FREE_LIMIT = 10;
  const remaining  = Math.max(0, FREE_LIMIT - todayCount);

  const visibleLinks = NAV_LINKS.filter(n => n.public || user);

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      padding: "0 2rem", height: "56px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      position: "sticky", top: 0,
      background: "rgba(8,8,8,0.88)",
      backdropFilter: "blur(12px)", zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
        <div style={{
          width: "26px", height: "26px", background: "var(--amber)",
          borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconSpark />
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "16px",
          fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)",
        }}>
          Pro<span style={{ color: "var(--amber)" }}>Prompter</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {visibleLinks.map(n => (
          <Link key={n.href} href={n.href} style={{
            padding: "5px 10px", borderRadius: "8px",
            fontSize: "12px", fontWeight: 500, textDecoration: "none",
            fontFamily: "var(--font-display)",
            color: pathname === n.href ? "var(--text-primary)" : "var(--text-secondary)",
            background: pathname === n.href ? "var(--bg-hover)" : "transparent",
            transition: "all .15s",
          }}>{n.label}</Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Usage bar */}
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
          <>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "var(--amber)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "#000",
              fontFamily: "var(--font-display)",
            }}>
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <button onClick={signOut} style={{
              padding: "5px 12px", background: "transparent",
              border: "1px solid var(--border)", borderRadius: "8px",
              color: "var(--text-secondary)", fontSize: "12px",
              cursor: "pointer", fontFamily: "var(--font-display)",
            }}>Sign out</button>
          </>
        ) : (
          <Link href="/login" style={{
            padding: "6px 14px", background: "var(--amber)",
            border: "none", borderRadius: "8px", color: "#000",
            fontSize: "12px", fontWeight: 700,
            textDecoration: "none", fontFamily: "var(--font-display)",
          }}>Sign in</Link>
        )}
      </div>
    </nav>
  );
}