import type { Metadata } from "next";
import Link from "next/link";
import { alsoTreated, conditionDir } from "@/lib/content";

export const metadata: Metadata = {
  title: "Conditions — Shree Sports & Ortho Clinic",
  description:
    "Plain-language information on the orthopaedic and sports conditions treated at the clinic.",
};

export default function ConditionsPage() {
  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Conditions
      </p>
      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 48,
          alignItems: "end",
          maxWidth: 1400,
          marginBottom: 56,
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
          Find your condition.
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
          Plain-language information on the problems the clinic treats. These pages explain and
          orient — they do not diagnose. If something here matches what you are feeling, book a
          consultation.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
          gap: "0 56px",
          maxWidth: 1400,
          borderTop: "1px solid var(--color-divider)",
        }}
      >
        {conditionDir.map((c) => (
          <Link
            key={c.key}
            href={`/conditions/${c.key}`}
            className="link-card hover-slide"
            style={{ padding: "28px 0 30px", borderBottom: "1px solid var(--color-divider)" }}
          >
            <span
              style={{
                display: "block",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
                marginBottom: 10,
              }}
            >
              {c.region}
            </span>
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-heading)",
                fontSize: 27,
                letterSpacing: "-0.02em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {c.name}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 15,
                color: "var(--color-neutral-700)",
                lineHeight: 1.55,
                maxWidth: "44ch",
              }}
            >
              {c.lede}
            </span>
          </Link>
        ))}
      </div>

      {alsoTreated.length > 0 && (
        <div
          style={{
            marginTop: 56,
            paddingTop: 28,
            borderTop: "1px solid var(--color-divider)",
            maxWidth: 1400,
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              margin: "0 0 16px",
            }}
          >
            Also treated
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {alsoTreated.map((name) => (
              <span
                key={name}
                className="tag tag-outline"
                style={{
                  fontSize: 13,
                  padding: "6px 12px",
                  borderColor: "var(--color-accent-2-400)",
                  color: "var(--color-accent-2-700)",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
