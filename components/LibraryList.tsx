"use client";

import { useCallback, useEffect, useState } from "react";
import { type Block, libraryCategories } from "@/lib/content";

type ListArticle = {
  key: string;
  title: string;
  category: string;
  read: string;
  date: string;
  author: string;
  excerpt: string;
  body: Block[];
};

export default function LibraryList({ articles }: { articles: ListArticle[] }) {
  const [filter, setFilter] = useState("All");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const list = articles.filter((a) => filter === "All" || a.category === filter);
  const categories = libraryCategories.filter(
    (c) => c === "All" || articles.some((a) => a.category === c),
  );
  const extra = [...new Set(articles.map((a) => a.category))].filter(
    (c) => !libraryCategories.includes(c),
  );

  const open = articles.find((a) => a.key === openKey) ?? null;

  const close = useCallback(() => {
    setOpenKey(null);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Deep link: /library?a=<key> (used by the home page and staff preview).
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("a");
    if (key && articles.some((a) => a.key === key)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value (the query string) that is not available during render/SSR.
      setOpenKey(key);
    }
  }, [articles]);

  // Close on Escape and lock body scroll while a dialog is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 44,
          paddingBottom: 24,
          borderBottom: "1px solid var(--color-divider)",
        }}
      >
        {[...categories, ...extra].map((category) => {
          const active = filter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={active}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 13,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "8px 16px",
                border: "1px solid var(--color-divider)",
                borderRadius: 20,
                cursor: "pointer",
                background: active ? "var(--color-text)" : "transparent",
                color: active ? "var(--color-bg)" : "var(--color-neutral-800)",
              }}
            >
              {category}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <p style={{ fontSize: 17, color: "var(--color-neutral-700)" }}>
          No articles in this category yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "44px 40px",
            maxWidth: 1400,
          }}
        >
          {list.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setOpenKey(a.key)}
              className="link-card title-link"
              style={{
                textAlign: "left",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                  marginBottom: 8,
                }}
              >
                {a.category} · {a.read}
              </span>
              <span
                className="title-link-t"
                style={{
                  display: "block",
                  fontFamily: "var(--font-heading)",
                  fontSize: 23,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                {a.title}
              </span>
              <span style={{ display: "block", fontSize: 13, color: "var(--color-neutral-600)" }}>
                {a.author} · {a.date}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(20,24,23,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "clamp(16px,5vh,72px) 16px",
            overflowY: "auto",
          }}
        >
          <article
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg)",
              borderRadius: 22,
              maxWidth: 760,
              width: "100%",
              padding: "clamp(24px,4vw,52px)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 38,
                height: 38,
                borderRadius: 19,
                border: "1px solid var(--color-divider)",
                background: "var(--color-bg)",
                fontSize: 18,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
                margin: "0 0 16px",
              }}
            >
              {open.category} · {open.read}
            </p>
            <h2
              style={{
                fontSize: "clamp(28px,3.6vw,42px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                margin: "0 0 14px",
                textWrap: "balance",
              }}
            >
              {open.title}
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-neutral-700)", margin: "0 0 28px" }}>
              {open.author} · {open.date}
            </p>

            {open.excerpt && (
              <p
                style={{
                  fontSize: 19,
                  lineHeight: 1.55,
                  margin: "0 0 24px",
                  color: "var(--color-neutral-800)",
                }}
              >
                {open.excerpt}
              </p>
            )}

            {open.body.map((block, i) => (
              <div key={i}>
                {block.kind === "h" && (
                  <h3 style={{ fontSize: 22, letterSpacing: "-0.02em", margin: "32px 0 12px" }}>
                    {block.text}
                  </h3>
                )}
                {block.kind === "p" && (
                  <p style={{ fontSize: 17, lineHeight: 1.65, margin: "0 0 18px" }}>{block.text}</p>
                )}
                {block.kind === "note" && (
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      margin: "28px 0 0",
                      padding: 18,
                      background: "var(--color-accent-2-100)",
                      color: "var(--color-accent-2-800)",
                      borderRadius: 16,
                    }}
                  >
                    {block.text}
                  </p>
                )}
              </div>
            ))}
          </article>
        </div>
      )}
    </>
  );
}
