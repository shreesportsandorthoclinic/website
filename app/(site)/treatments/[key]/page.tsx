import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { treatmentDir, treatments } from "@/lib/content";

type Params = { params: Promise<{ key: string }> };

export function generateStaticParams() {
  return treatmentDir.map((t) => ({ key: t.key }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { key } = await params;
  const treatment = treatments[key];
  if (!treatment) return {};
  return {
    title: `${treatment.name} — Shree Sports & Ortho Clinic`,
    description: treatment.blurb,
  };
}

export default async function TreatmentPage({ params }: Params) {
  const { key } = await params;
  const treat = treatments[key];
  if (!treat) notFound();

  return (
    <main className="pad" style={{ padding: "40px 48px 90px" }}>
      <nav style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 36 }}>
        <Link href="/" style={{ color: "inherit" }}>
          Home
        </Link>{" "}
        <span style={{ opacity: 0.5 }}>/</span>{" "}
        <Link href="/treatments" style={{ color: "inherit" }}>
          Treatments
        </Link>{" "}
        <span style={{ opacity: 0.5 }}>/</span>{" "}
        <span style={{ color: "var(--color-text)" }}>{treat.name}</span>
      </nav>

      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 52,
          alignItems: "end",
          maxWidth: 1400,
          marginBottom: 60,
        }}
      >
        <div>
          <p className="eyebrow" style={{ margin: "0 0 18px" }}>
            Treatment
          </p>
          <h1
            style={{
              fontSize: "clamp(38px,5.2vw,72px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              margin: "0 0 22px",
            }}
          >
            {treat.name}
          </h1>
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.5,
              color: "var(--color-neutral-800)",
              maxWidth: "44ch",
              margin: 0,
            }}
          >
            {treat.blurb}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link className="btn btn-primary" href="/book" style={{ padding: "15px 24px" }}>
            Book an appointment
          </Link>
          <Link className="btn btn-secondary" href="/contact" style={{ padding: "15px 24px" }}>
            Ask the clinic
          </Link>
        </div>
      </div>

      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          maxWidth: 1400,
          marginBottom: 56,
        }}
      >
        <section>
          <h2 className="sec-h">What it involves</h2>
          <p style={{ fontSize: 19, lineHeight: 1.6, margin: "0 0 34px", maxWidth: "56ch" }}>
            {treat.involves}
          </p>
          <h2 className="sec-h">Who it may be appropriate for</h2>
          <ul className="dotlist">
            {treat.who.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="sec-h">What to expect</h2>
          <ol style={{ margin: "0 0 34px", padding: 0, listStyle: "none" }}>
            {treat.expect.map((item) => (
              <li
                key={item}
                style={{
                  padding: "14px 0 14px 40px",
                  position: "relative",
                  fontSize: 17,
                  lineHeight: 1.5,
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 14,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    color: "var(--color-accent-700)",
                  }}
                >
                  STEP
                </span>
                {item}
              </li>
            ))}
          </ol>
          <h2 className="sec-h">Recovery</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, margin: 0, maxWidth: "52ch" }}>
            {treat.recovery}
          </p>
        </section>
      </div>

      <section style={{ maxWidth: 900 }}>
        <h2 className="sec-h" style={{ marginBottom: 8 }}>
          Frequently asked
        </h2>
        {treat.faqs.map((faq) => (
          <div key={faq.q} style={{ padding: "22px 0", borderBottom: "1px solid var(--color-divider)" }}>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 600,
                margin: "0 0 8px",
                letterSpacing: "-0.015em",
              }}
            >
              {faq.q}
            </p>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-neutral-800)",
                margin: 0,
                maxWidth: "60ch",
                lineHeight: 1.55,
              }}
            >
              {faq.a}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
