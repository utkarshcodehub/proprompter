"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";

// Auto-stop this long after the last recognized words. Before the first
// words, the browser's own "no-speech" timeout (~8s of silence) applies.
const SILENCE_MS       = 2500;
const ERROR_VISIBLE_MS = 4000;

function getRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const subscribe = () => () => {};

/**
 * Speech-to-text into a controlled text field.
 * Interim results stream into `value` via `onChange`; typing while
 * listening stops the mic and keeps what was typed.
 */
export function useSpeechInput({ value, onChange }) {
  // false on the server and during hydration, real answer on the client
  const supported = useSyncExternalStore(subscribe, () => !!getRecognition(), () => false);

  const [listening, setListening] = useState(false);
  const [capturing, setCapturing] = useState(false);  // mic is actually open (can lag start by seconds)
  const [denied, setDenied]       = useState(false);
  const [error, setError]         = useState(null);

  const recognitionRef = useRef(null);
  const baseRef        = useRef("");
  const lastWrittenRef = useRef(null);
  const silenceRef     = useRef(null);
  const errorTimerRef  = useRef(null);
  const onChangeRef    = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; });

  const flashError = useCallback((message) => {
    setError(message);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), ERROR_VISIBLE_MS);
  }, []);

  const stop = useCallback(() => {
    clearTimeout(silenceRef.current);
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognition();
    if (!Recognition || recognitionRef.current) return;

    const rec = new Recognition();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = navigator.language || "en-US";

    // Dictation appends to whatever is already typed
    baseRef.current        = value && !/\s$/.test(value) ? `${value} ` : value;
    lastWrittenRef.current = value;

    const armSilence = () => {
      clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => rec.stop(), SILENCE_MS);
    };

    rec.onstart = () => {
      if (recognitionRef.current !== rec) return;
      setError(null);
      setListening(true);
    };

    rec.onaudiostart = () => {
      if (recognitionRef.current !== rec) return;
      setCapturing(true);
    };

    rec.onresult = (event) => {
      if (recognitionRef.current !== rec) return;  // session was cancelled
      let spoken = "";
      for (let i = 0; i < event.results.length; i++) {
        spoken += event.results[i][0].transcript;
      }
      const next = baseRef.current + spoken.trimStart();
      lastWrittenRef.current = next;
      onChangeRef.current(next);
      armSilence();
    };

    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setDenied(true);
      } else if (event.error === "network") {
        flashError("Voice input unavailable");
      } else if (event.error === "audio-capture") {
        flashError("No microphone found");
      } else if (event.error === "no-speech") {
        flashError("Didn't catch that — try again");
      }
      // "aborted" ends quietly
    };

    rec.onend = () => {
      if (recognitionRef.current !== rec) return;  // a newer session owns the state
      clearTimeout(silenceRef.current);
      recognitionRef.current = null;
      setListening(false);
      setCapturing(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      recognitionRef.current = null;
    }
  }, [value, flashError]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  // The user typed while listening — hand control back to the keyboard
  useEffect(() => {
    if (listening && value !== lastWrittenRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;  // ignore anything it still sends
      clearTimeout(silenceRef.current);
      setListening(false);
      setCapturing(false);
      rec?.abort();
    }
  }, [value, listening]);

  useEffect(() => () => {
    clearTimeout(silenceRef.current);
    clearTimeout(errorTimerRef.current);
    recognitionRef.current?.abort();
  }, []);

  return { supported, listening, capturing, denied, error, toggle, stop };
}
