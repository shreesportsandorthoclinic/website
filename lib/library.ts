import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { articleBody, articles, type Block } from "./content";

/* ─────────────────────────────────────────────────────────────────────────
   Health-library store.

   Articles are editable from /staff/library. Like the appointments store,
   this keeps them in a JSON file under .data/ — a stand-in for a real
   database. On a serverless host the filesystem is ephemeral, so edits made
   in production will not survive a redeploy; move this to a database (or
   Vercel storage) before the clinic relies on it. Every read and write goes
   through the functions below, so only this file changes.

   Uploaded images are stored inline as data: URLs on the article, so there
   is no upload directory to manage.
   ───────────────────────────────────────────────────────────────────────── */

export type ArticleImage = { src: string; alt: string };

export type LibraryArticle = {
  key: string;
  title: string;
  category: string;
  read: string;
  date: string;
  author: string;
  excerpt: string;
  image: ArticleImage;
  body: Block[];
  updatedAt: string;
};

export type ArticleInput = Omit<LibraryArticle, "key" | "updatedAt">;

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "articles.json");

let queue: Promise<unknown> = Promise.resolve();
function serialise<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work, work);
  queue = next.catch(() => {});
  return next;
}

/* First-run seed: the articles currently hard-coded in content.ts, each
   given its own copy of the one written body that shipped with the canvas. */
function seed(): LibraryArticle[] {
  const now = new Date().toISOString();
  return Object.values(articles).map((a) => ({
    key: a.key,
    title: a.title,
    category: a.category,
    read: a.read,
    date: a.date,
    author: a.author,
    excerpt: "",
    image: { src: a.image.src, alt: a.image.alt },
    body: articleBody.map((b) => ({ ...b })),
    updatedAt: now,
  }));
}

async function readAll(): Promise<LibraryArticle[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LibraryArticle[];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  const seeded = seed();
  await writeAll(seeded);
  return seeded;
}

async function writeAll(rows: LibraryArticle[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const temporary = `${DATA_FILE}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(rows, null, 2), "utf8");
  await rename(temporary, DATA_FILE);
}

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "article"
  );
}

/* ── queries ──────────────────────────────────────────────────────────── */

export async function listArticles(): Promise<LibraryArticle[]> {
  const rows = await readAll();
  return [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getArticle(key: string): Promise<LibraryArticle | null> {
  const rows = await readAll();
  return rows.find((row) => row.key === key) ?? null;
}

/* ── mutations ────────────────────────────────────────────────────────── */

export async function createArticle(input: ArticleInput): Promise<LibraryArticle> {
  return serialise(async () => {
    const rows = await readAll();
    const base = slugify(input.title);
    let key = base;
    let n = 2;
    while (rows.some((row) => row.key === key)) key = `${base}-${n++}`;

    const article: LibraryArticle = {
      ...input,
      key,
      updatedAt: new Date().toISOString(),
    };
    await writeAll([article, ...rows]);
    return article;
  });
}

export async function updateArticle(
  key: string,
  patch: Partial<ArticleInput>,
): Promise<LibraryArticle | null> {
  return serialise(async () => {
    const rows = await readAll();
    const index = rows.findIndex((row) => row.key === key);
    if (index === -1) return null;

    const updated: LibraryArticle = {
      ...rows[index],
      ...patch,
      key,
      updatedAt: new Date().toISOString(),
    };
    const next = [...rows];
    next[index] = updated;
    await writeAll(next);
    return updated;
  });
}

/** Coerce untrusted JSON from the editor into a valid article input. */
export function normaliseInput(body: Partial<ArticleInput>): ArticleInput | null {
  const title = body.title?.trim();
  const category = body.category?.trim();
  if (!title || !category) return null;

  const kinds = new Set(["h", "p", "note"]);
  return {
    title,
    category,
    read: body.read?.trim() || "4 min read",
    date:
      body.date?.trim() ||
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    author: body.author?.trim() || "Dr. Neel",
    excerpt: body.excerpt?.trim() || "",
    image: { src: body.image?.src?.trim() || "", alt: body.image?.alt?.trim() || title },
    body: Array.isArray(body.body)
      ? body.body
          .filter((b): b is Block => !!b && kinds.has(b.kind) && typeof b.text === "string")
          .map((b) => ({ kind: b.kind, text: b.text.trim() }))
          .filter((b) => b.text.length > 0)
      : [],
  };
}

export async function deleteArticle(key: string): Promise<boolean> {
  return serialise(async () => {
    const rows = await readAll();
    const next = rows.filter((row) => row.key !== key);
    if (next.length === rows.length) return false;
    await writeAll(next);
    return true;
  });
}
