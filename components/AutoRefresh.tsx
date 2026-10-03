"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches the page's server data every `seconds` while the tab is visible,
    so the doctor's and reception's screens stay in step without a reload.
    Form fields keep what's been typed — only server-rendered data changes.

    With `chimeOn`, plays a short tone whenever that number goes up (e.g. a
    new bill reaching the desk). Browsers only allow sound after the person
    has clicked somewhere on the page once. */
export default function AutoRefresh({
  seconds = 8,
  chimeOn,
}: {
  seconds?: number;
  chimeOn?: number;
}) {
  const router = useRouter();
  const previous = useRef(chimeOn);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);

  useEffect(() => {
    if (chimeOn == null) return;
    if (previous.current != null && chimeOn > previous.current) chime();
    previous.current = chimeOn;
  }, [chimeOn]);

  return null;
}

function chime() {
  try {
    const ctx = new AudioContext();
    const tone = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.4);
    };
    tone(880, 0);
    tone(1175, 0.18);
    setTimeout(() => ctx.close(), 1000);
  } catch {
    /* no audio available — the list still updates */
  }
}
