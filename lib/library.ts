import "server-only";

import type { Block } from "./content";
import { sql } from "./db";

/* ─────────────────────────────────────────────────────────────────────────
   Health-library store — Supabase Postgres (`articles` table, created by
   db/schema.sql).

   Articles are editable from /staff/library. `npm run db:seed` loads the
   starting set. Hero images are stored inline as data: URLs on the row
   (the `image` jsonb column), so there is no upload directory to manage.
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

type Row = {
  key: string;
  title: string;
  category: string;
  read: string;
  date: string;
  author: string;
  excerpt: string;
  image: ArticleImage;
  body: Block[];
  updated_at: Date;
};

function toArticle(row: Row): LibraryArticle {
  return {
    key: row.key,
    title: row.title,
    category: row.category,
    read: row.read,
    date: row.date,
    author: row.author,
    excerpt: row.excerpt,
    image: row.image,
    body: row.body,
    updatedAt: row.updated_at.toISOString(),
  };
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

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

/* ── queries ──────────────────────────────────────────────────────────── */

export async function listArticles(): Promise<LibraryArticle[]> {
  const rows = await sql<Row[]>`select * from articles order by updated_at desc`;
  return rows.map(toArticle);
}

export async function getArticle(key: string): Promise<LibraryArticle | null> {
  const [row] = await sql<Row[]>`select * from articles where key = ${key}`;
  return row ? toArticle(row) : null;
}

/* ── mutations ────────────────────────────────────────────────────────── */

export async function createArticle(input: ArticleInput): Promise<LibraryArticle> {
  const base = slugify(input.title);

  /* Try the plain slug, then slug-2, slug-3, … until one is free. The
     primary-key constraint is the real guard against a race between the
     check and the insert — a collision just moves to the next suffix. */
  for (let attempt = 1; attempt <= 50; attempt++) {
    const key = attempt === 1 ? base : `${base}-${attempt}`;
    try {
      const [row] = await sql<Row[]>`
        insert into articles (key, title, category, read, date, author, excerpt, image, body)
        values (
          ${key}, ${input.title}, ${input.category}, ${input.read}, ${input.date},
          ${input.author}, ${input.excerpt}, ${sql.json(input.image)}, ${sql.json(input.body)}
        )
        on conflict (key) do nothing
        returning *
      `;
      if (row) return toArticle(row);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("Could not allocate a unique article key");
}

export async function updateArticle(
  key: string,
  patch: Partial<ArticleInput>,
): Promise<LibraryArticle | null> {
  const [row] = await sql<Row[]>`
    update articles set
      title = ${patch.title ?? sql`title`},
      category = ${patch.category ?? sql`category`},
      read = ${patch.read ?? sql`read`},
      date = ${patch.date ?? sql`date`},
      author = ${patch.author ?? sql`author`},
      excerpt = ${patch.excerpt ?? sql`excerpt`},
      image = ${patch.image ? sql.json(patch.image) : sql`image`},
      body = ${patch.body ? sql.json(patch.body) : sql`body`},
      updated_at = now()
    where key = ${key}
    returning *
  `;
  return row ? toArticle(row) : null;
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
  const rows = await sql`delete from articles where key = ${key} returning key`;
  return rows.length > 0;
}
