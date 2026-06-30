"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const authError    = searchParams.get("error");

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-body), DM Sans, sans-serif",
    }}>
      <div style={{
        position: "fixed", top: "-200px", left: "50%",
        transform: "translateX(-50%)", width: "500px", height: "400px",
        background: "radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "40px 36px",
        width: "380px",
        maxWidth: "90vw",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "8px", marginBottom: "28px",
        }}>
          <div style={{
            width: "32px", height: "32px",
            background: "var(--amber)", borderRadius: "8px",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "16px",
          }}>✦</div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px", fontWeight: 800,
            letterSpacing: "-0.02em", color: "var(--text-primary)",
          }}>
            Pro<span style={{ color: "var(--amber)" }}>Prompter</span>
          </span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px", fontWeight: 800,
          letterSpacing: "-0.02em", marginBottom: "8px",
        }}>
          Sign in to continue
        </h1>
        <p style={{
          fontSize: "13px", color: "var(--text-secondary)",
          lineHeight: 1.6, marginBottom: "28px",
        }}>
          Save your prompt history, build collections,<br />
          and compare modes side by side.
        </p>

        {authError && (
          <div style={{
            padding: "10px 14px",
            background: "rgba(229,83,83,0.08)",
            border: "1px solid rgba(229,83,83,0.2)",
            borderRadius: "10px",
            color: "var(--red)",
            fontSize: "12px",
            marginBottom: "16px",
          }}>
            Authentication failed. Please try again.
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%", padding: "12px 20px",
            background: "var(--text-primary)",
            border: "none", borderRadius: "12px",
            color: "#000", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-display)",
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: "10px",
            transition: "opacity .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{
          fontSize: "11px", color: "var(--text-tertiary)",
          marginTop: "20px", lineHeight: 1.5,
        }}>
          By signing in you agree to our terms. ProPrompter
          does not store your prompts without your permission.
        </p>
      </div>
    </div>
  );
}