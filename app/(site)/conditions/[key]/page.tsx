import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Photo from "@/components/Photo";
import { clinic, conditionDir, conditions } from "@/lib/content";

type Params = { params: Promise<{ key: string }> };

export function generateStaticParams() {
  return conditionDir.map((c) => ({ key: c.key }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { key } = await params;
  const condition = conditions[key];
  if (!condition) return {};
  return {
    title: `${condition.name} — Shree Sports & Ortho Clinic`,
    description: condition.lede,
  };
}

export default async function ConditionPage({ params }: Params) {
  const { key } = await params;
  const cond = conditions[key];
  if (!cond) notFound();

  const related = conditionDir.filter((c) => c.key !== cond.key).slice(0, 3);

  return (
    <main className="pad" style={{ padding: "40px 48px 90px" }}>
      <nav style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 36 }}>
        <Link href="/" style={{ color: "inherit" }}>
          Home
        </Link>{" "}
        <span style={{ opacity: 0.5 }}>/</span>{" "}
        <Link href="/conditions" style={{ color: "inherit" }}>
          Conditions
        </Link>{" "}
        <span style={{ opacity: 0.5 }}>/</span>{" "}
        <span style={{ color: "var(--color-text)" }}>{cond.name}</span>
      </nav>

      <div
        className="hero"
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 52,
          alignItems: "end",
          maxWidth: 1400,
          marginBottom: 64,
        }}
      >
        <div>
          <p className="eyebrow" style={{ margin: "0 0 18px" }}>
            {cond.region}
          </p>
          <h1
            style={{
              fontSize: "clamp(40px,5.6vw,78px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              margin: "0 0 22px",
            }}
          >
            {cond.name}
          </h1>
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.5,
              color: "var(--color-neutral-800)",
              maxWidth: "40ch",
              margin: "0 0 28px",
            }}
          >
            {cond.lede}
          </p>
          <Link className="btn btn-primary" href="/book" style={{ fontSize: 12, padding: "15px 28px" }}>
            Book an appointment
          </Link>
        </div>
        <Photo photo={cond.image} ratio="1/1" priority />
      </div>

      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 64,
          maxWidth: 1400,
          alignItems: "start",
        }}
      >
        <div>
          <section style={{ marginBottom: 52 }}>
            <h2 className="sec-h">What is it?</h2>
            <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: "62ch", margin: 0 }}>{cond.what}</p>
          </section>

          <div
            className="two"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              marginBottom: 52,
            }}
          >
            <section>
              <h2 className="sec-h">Common symptoms</h2>
              <ul className="dotlist">
                {cond.symptoms.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="sec-h">Common causes</h2>
              <ul className="dotlist">
                {cond.causes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section
            style={{
              marginBottom: 52,
              background: "var(--color-accent-2-100)",
              padding: 32,
              borderRadius: 20,
            }}
          >
            <h2
              className="sec-h"
              style={{ color: "var(--color-accent-2-700)", borderBottom: "none", paddingBottom: 0 }}
            >
              When should you seek medical attention?
            </h2>
            <ul style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "grid", gap: 8 }}>
              {cond.seek.map((item) => (
                <li key={item} style={{ fontSize: 17, lineHeight: 1.5, paddingLeft: 20, position: "relative" }}>
                  <span
                    style={{ position: "absolute", left: 0, top: 0, color: "var(--color-accent-2-700)" }}
                  >
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-accent-2-800)" }}>
              If any of these apply, seek medical assessment rather than waiting. In an emergency, go
              to the nearest hospital.
            </p>
          </section>

          <div
            className="two"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 52 }}
          >
            <section>
              <h2 className="sec-h">How is it evaluated?</h2>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {cond.evaluated.map((item) => (
                  <li key={item} style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 12 }}>
                    {item}
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="sec-h">Possible treatment approaches</h2>
              <ul className="dotlist">
                {cond.options.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 14 }}>
                Which of these applies to you is decided at consultation.
              </p>
            </section>
          </div>

          <section style={{ marginBottom: 52 }}>
            <h2 className="sec-h">Recovery &amp; rehabilitation</h2>
            <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: "62ch", margin: 0 }}>
              {cond.recovery}
            </p>
          </section>

          <section>
            <h2 className="sec-h" style={{ marginBottom: 8 }}>
              Frequently asked
            </h2>
            {cond.faqs.map((faq) => (
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
        </div>

        <aside className="sticky-aside" style={{ position: "sticky", top: 150, display: "grid", gap: 32 }}>
          <div
            style={{
              background: "var(--color-accent-800)",
              color: "#ffffff",
              padding: 28,
              borderRadius: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-accent-300)",
                margin: "0 0 12px",
              }}
            >
              Next step
            </p>
            <p style={{ fontSize: 22, lineHeight: 1.25, margin: "0 0 18px", letterSpacing: "-0.015em" }}>
              Have this looked at properly.
            </p>
            <Link
              className="btn btn-primary btn-block"
              href="/book"
              style={{ fontSize: 12, padding: "15px 26px" }}
            >
              Book appointment
            </Link>
            <p style={{ fontSize: 13, color: "var(--color-accent-100)", margin: "14px 0 0" }}>
              Electronic City Phase-1 · {clinic.hours.clinicLine}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-neutral-700)",
                margin: "0 0 14px",
                paddingBottom: 10,
                borderBottom: "1px solid var(--color-divider)",
              }}
            >
              Related
            </p>
            {related.map((r) => (
              <Link
                key={r.key}
                href={`/conditions/${r.key}`}
                className="link-card"
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid var(--color-divider)",
                  fontSize: 17,
                }}
              >
                {r.name}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.5, margin: 0 }}>
            This page is general information about a condition. It is not a diagnosis and does not
            replace an examination.
          </p>
        </aside>
      </div>
    </main>
  );
}
