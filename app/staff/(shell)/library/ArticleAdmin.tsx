"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { libraryCategories } from "@/lib/content";

type Block = { kind: "h" | "p" | "note"; text: string };

type Article = {
  key: string;
  title: string;
  category: string;
  read: string;
  date: string;
  author: string;
  excerpt: string;
  image: { src: string; alt: string };
  body: Block[];
  updatedAt: string;
};

type Draft = Omit<Article, "key" | "updatedAt">;

const BLANK: Draft = {
  title: "",
  category: "",
  read: "4 min read",
  date: "",
  author: "Dr. Neel",
  excerpt: "",
  image: { src: "", alt: "" },
  body: [],
};

const KIND_LABEL: Record<Block["kind"], string> = {
  h: "Heading",
  p: "Paragraph",
  note: "Note box",
};

const MAX_IMAGE_BYTES = 12_000_000;

/** Load an image file, scale it so the longest side is at most `maxSide`, and
    return a JPEG data URL. Keeps stored images to a few hundred KB. */
async function compressImage(file: File, maxSide: number, quality: number): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(async () => {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode failed"));
        img.src = url;
      });
      return img as unknown as ImageBitmap;
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

const panel = {
  border: "1px solid var(--color-divider)",
  borderRadius: 16,
  padding: 20,
  background: "#fff",
} as const;

export default function ArticleAdmin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await fetch("/api/staff/articles");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch {
      setListError("Could not load articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const editing = useMemo(
    () => articles.find((a) => a.key === editingKey) ?? null,
    [articles, editingKey],
  );

  async function remove(key: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/staff/articles/${key}`, { method: "DELETE" });
    if (res.ok) void load();
    else window.alert("Could not delete that article.");
  }

  if (creating || editing) {
    return (
      <Editor
        initial={
          editing
            ? {
                title: editing.title,
                category: editing.category,
                read: editing.read,
                date: editing.date,
                author: editing.author,
                excerpt: editing.excerpt,
                image: editing.image,
                body: editing.body,
              }
            : BLANK
        }
        heading={editing ? "Edit article" : "New article"}
        onCancel={() => {
          setCreating(false);
          setEditingKey(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditingKey(null);
          void load();
        }}
        endpoint={editing ? `/api/staff/articles/${editing.key}` : "/api/staff/articles"}
        method={editing ? "PUT" : "POST"}
      />
    );
  }

  return (
    <main className="pad" style={{ padding: "40px 32px 80px", maxWidth: 1100 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontSize: 34, letterSpacing: "-0.03em", margin: 0 }}>Health library</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCreating(true)}
          style={{ fontSize: 12, padding: "12px 22px" }}
        >
          New article
        </button>
      </div>
      <p style={{ fontSize: 15, color: "var(--color-neutral-700)", margin: "0 0 28px" }}>
        These are the articles published at{" "}
        <Link href="/library" style={{ color: "var(--color-accent-700)" }}>
          /library
        </Link>
        . Changes go live immediately.
      </p>

      {loading && <p style={{ color: "var(--color-neutral-600)" }}>Loading…</p>}
      {listError && <p style={{ color: "var(--color-accent-2-700)" }}>{listError}</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {articles.map((a) => (
          <div
            key={a.key}
            style={{
              ...panel,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 96,
                height: 64,
                flex: "none",
                borderRadius: 10,
                background: "var(--color-neutral-200)",
                backgroundImage: a.image.src ? `url(${a.image.src})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17 }}>
                {a.title}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-neutral-600)" }}>
                {a.category} · {a.read} · {a.date || "no date"} · {a.body.length} block
                {a.body.length === 1 ? "" : "s"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/library?a=${a.key}`}
                target="_blank"
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "9px 16px" }}
              >
                View
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingKey(a.key)}
                style={{ fontSize: 12, padding: "9px 16px" }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => remove(a.key, a.title)}
                style={{
                  fontSize: 12,
                  padding: "9px 16px",
                  borderColor: "var(--color-accent-2-400)",
                  color: "var(--color-accent-2-700)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && !listError && articles.length === 0 && (
          <p style={{ color: "var(--color-neutral-600)" }}>No articles yet. Add the first one.</p>
        )}
      </div>
    </main>
  );
}

function Editor({
  initial,
  heading,
  endpoint,
  method,
  onCancel,
  onSaved,
}: {
  initial: Draft;
  heading: string;
  endpoint: string;
  method: "POST" | "PUT";
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function addBlock(kind: Block["kind"]) {
    set("body", [...draft.body, { kind, text: "" }]);
  }
  function updateBlock(i: number, patch: Partial<Block>) {
    set(
      "body",
      draft.body.map((b, j) => (j === i ? { ...b, ...patch } : b)),
    );
  }
  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= draft.body.length) return;
    const next = [...draft.body];
    [next[i], next[j]] = [next[j], next[i]];
    set("body", next);
  }
  function removeBlock(i: number) {
    set(
      "body",
      draft.body.filter((_, j) => j !== i),
    );
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That file is very large. Choose an image under 12 MB.");
      return;
    }
    setError("");
    try {
      /* Downscale and re-encode in the browser so the stored data URL stays
         small (article rows and API responses carry it inline). */
      const dataUrl = await compressImage(file, 1600, 0.82);
      set("image", { src: dataUrl, alt: draft.image.alt || draft.title });
    } catch {
      setError("Could not read that image. Try a different file.");
    }
  }

  async function save() {
    if (!draft.title.trim() || !draft.category.trim()) {
      setError("A title and a category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Could not reach the server.");
      setSaving(false);
    }
  }

  const labelStyle = { fontSize: 13, display: "block", marginBottom: 5 } as const;
  const round = { minHeight: 44, fontSize: 15, borderRadius: 12 } as const;

  return (
    <main className="pad" style={{ padding: "40px 32px 90px", maxWidth: 860 }}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onCancel}
        style={{ fontSize: 14, marginBottom: 16 }}
      >
        ← Back to library
      </button>
      <h1 style={{ fontSize: 32, letterSpacing: "-0.03em", margin: "0 0 24px" }}>{heading}</h1>

      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={labelStyle} htmlFor="ar-title">
            Title
          </label>
          <input
            id="ar-title"
            className="input"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            style={round}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="ar-cat">
              Category
            </label>
            <input
              id="ar-cat"
              className="input"
              list="ar-cats"
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              style={round}
            />
            <datalist id="ar-cats">
              {libraryCategories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c} value={c} />
                ))}
            </datalist>
          </div>
          <div>
            <label style={labelStyle} htmlFor="ar-read">
              Read time
            </label>
            <input
              id="ar-read"
              className="input"
              value={draft.read}
              onChange={(e) => set("read", e.target.value)}
              placeholder="5 min read"
              style={round}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="ar-date">
              Date shown
            </label>
            <input
              id="ar-date"
              className="input"
              value={draft.date}
              onChange={(e) => set("date", e.target.value)}
              placeholder="18 August 2026"
              style={round}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="ar-author">
              Author
            </label>
            <input
              id="ar-author"
              className="input"
              value={draft.author}
              onChange={(e) => set("author", e.target.value)}
              style={round}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="ar-excerpt">
            Excerpt / intro (optional, shown at the top of the article)
          </label>
          <textarea
            id="ar-excerpt"
            className="input"
            value={draft.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            style={{ ...round, minHeight: 80 }}
          />
        </div>

        <div style={panel}>
          <p style={{ ...labelStyle, marginBottom: 10, fontWeight: 600 }}>Hero image</p>
          {draft.image.src ? (
            <img
              src={draft.image.src}
              alt=""
              style={{
                width: "100%",
                maxHeight: 240,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
          ) : (
            <p style={{ fontSize: 14, color: "var(--color-neutral-600)", margin: "0 0 12px" }}>
              No image yet.
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickImage}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: 12, padding: "9px 16px" }}
            >
              {draft.image.src ? "Replace image" : "Upload image"}
            </button>
            {draft.image.src && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => set("image", { src: "", alt: "" })}
                style={{ fontSize: 12, padding: "9px 16px" }}
              >
                Remove
              </button>
            )}
          </div>
          <label style={{ ...labelStyle, marginTop: 12 }} htmlFor="ar-alt">
            Image description (for accessibility)
          </label>
          <input
            id="ar-alt"
            className="input"
            value={draft.image.alt}
            onChange={(e) => set("image", { ...draft.image, alt: e.target.value })}
            style={round}
          />
        </div>

        <div>
          <p style={{ ...labelStyle, fontWeight: 600, marginBottom: 10 }}>Content</p>
          <div style={{ display: "grid", gap: 12 }}>
            {draft.body.map((block, i) => (
              <div key={i} style={panel}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <select
                    value={block.kind}
                    onChange={(e) => updateBlock(i, { kind: e.target.value as Block["kind"] })}
                    className="input"
                    style={{ width: "auto", minHeight: 36, fontSize: 13, borderRadius: 10 }}
                  >
                    {(["h", "p", "note"] as const).map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button type="button" className="btn btn-secondary" style={miniBtn} onClick={() => moveBlock(i, -1)}>
                      ↑
                    </button>
                    <button type="button" className="btn btn-secondary" style={miniBtn} onClick={() => moveBlock(i, 1)}>
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ ...miniBtn, color: "var(--color-accent-2-700)", borderColor: "var(--color-accent-2-400)" }}
                      onClick={() => removeBlock(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <textarea
                  className="input"
                  value={block.text}
                  onChange={(e) => updateBlock(i, { text: e.target.value })}
                  placeholder={block.kind === "h" ? "Section heading" : "Text…"}
                  style={{ minHeight: block.kind === "h" ? 44 : 96, fontSize: 15, borderRadius: 12 }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" style={addBtn} onClick={() => addBlock("h")}>
              + Heading
            </button>
            <button type="button" className="btn btn-secondary" style={addBtn} onClick={() => addBlock("p")}>
              + Paragraph
            </button>
            <button type="button" className="btn btn-secondary" style={addBtn} onClick={() => addBlock("note")}>
              + Note box
            </button>
          </div>
        </div>

        {error && <p style={{ color: "var(--color-accent-2-700)", fontSize: 14, margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
            style={{ fontSize: 12, padding: "14px 26px" }}
          >
            {saving ? "Saving…" : "Save article"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ fontSize: 12, padding: "14px 26px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

const miniBtn = { fontSize: 12, padding: "6px 10px", minWidth: 34 } as const;
const addBtn = { fontSize: 12, padding: "10px 16px" } as const;
