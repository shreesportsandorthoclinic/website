"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "om-cookie-notice-dismissed-v1";

/* This site currently sets no analytics/advertising cookies (see
   /cookies), so there is nothing to ask consent for yet. This is a plain
   notice rather than an accept/reject banner. If the clinic later adds
   anything that sets a non-essential cookie (analytics, a live Maps
   embed, payments), replace this with a real opt-in consent gate that
   blocks that script until the visitor accepts. */
export default function CookieNotice() {
  /* Starts hidden so server and first client render match (localStorage
     does not exist on the server); the effect below is a one-time read of
     that external, browser-only store to decide whether to reveal it —
     the pattern React's own docs endorse for syncing with a platform API
     that cannot be read during render. */
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!localStorage.getItem(KEY);
    } catch {
      // Storage may be unavailable (private browsing, blocked); treat as
      // not dismissed rather than breaking the page.
    }
    if (!dismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only store (localStorage) that cannot be accessed during render/SSR.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Ignore — the notice will just reappear next visit.
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 60,
        maxWidth: 560,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        borderRadius: 20,
        background: "var(--color-text)",
        color: "var(--color-bg)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, flex: "1 1 260px" }}>
        This site does not use tracking or advertising cookies. See the{" "}
        <Link href="/cookies" style={{ color: "inherit", textDecoration: "underline" }}>
          Cookie Policy
        </Link>{" "}
        for details.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="btn btn-primary"
        style={{ fontSize: 12, padding: "10px 18px", flex: "none" }}
      >
        Got it
      </button>
    </div>
  );
}
