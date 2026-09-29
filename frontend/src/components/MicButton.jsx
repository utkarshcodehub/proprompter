"use client";

import { useEffect } from "react";
import { useSpeechInput } from "@/hooks/useSpeechInput";

const IconMic = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
  </svg>
);

export default function MicButton({ value, onChange, disabled = false }) {
  const { supported, listening, capturing, denied, error, toggle, stop } = useSpeechInput({ value, onChange });

  // e.g. user hit ⌘↵ mid-dictation — stop writing into the field
  useEffect(() => {
    if (disabled && listening) stop();
  }, [disabled, listening, stop]);

  if (!supported) return null;

  const blocked = denied || disabled;
  const label   = denied
    ? "Microphone access blocked — enable it in browser settings"
    : listening ? "Stop voice input" : "Voice input";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {(listening || error) && (
        <span role="status" style={{
          fontSize: "11px", fontWeight: 600, fontFamily: "var(--font-display)",
          color: error ? "var(--red)" : "var(--amber)",
        }}>
          {error || (capturing ? "Listening…" : "Starting mic…")}
        </span>
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={blocked}
        title={label}
        aria-label={label}
        aria-pressed={listening}
        style={{
          width: "30px", height: "30px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "8px",
          background: listening ? "rgba(245,166,35,0.1)" : "var(--bg)",
          border: `1px solid ${listening ? "var(--amber)" : "var(--border)"}`,
          color: listening ? "var(--amber)" : "var(--text-secondary)",
          cursor: blocked ? "not-allowed" : "pointer",
          opacity: blocked ? 0.4 : 1,
          animation: capturing ? "pulse-amber 1.5s infinite" : "none",
          transition: "all .15s",
        }}
      >
        <IconMic />
      </button>
    </div>
  );
}
