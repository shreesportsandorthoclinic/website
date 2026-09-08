import type { Metadata } from "next";
import LibraryList from "@/components/LibraryList";
import { listArticles } from "@/lib/library";

export const metadata: Metadata = {
  title: "Health library — Shree Sports & Ortho Clinic",
  description:
    "Plain-language orthopaedic and sports injury information written by the clinic for patients in Electronic City, Bengaluru.",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const articles = (await listArticles()).map((a) => ({
    key: a.key,
    title: a.title,
    category: a.category,
    read: a.read,
    date: a.date,
    author: a.author,
    image: a.image,
    excerpt: a.excerpt,
    body: a.body,
  }));

  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Health library
      </p>
      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 48,
          alignItems: "end",
          maxWidth: 1400,
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(38px,5.4vw,74px)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Questions we get asked, answered properly.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--color-neutral-800)",
            margin: 0,
            maxWidth: "40ch",
            lineHeight: 1.55,
          }}
        >
          Written by the clinic for patients in Electronic City. General information, not medical
          advice for your specific case.
        </p>
      </div>

      <LibraryList articles={articles} />
    </main>
  );
}
