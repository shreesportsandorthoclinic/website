import type { Metadata } from "next";
import Link from "next/link";
import { treatmentDir } from "@/lib/content";

export const metadata: Metadata = {
  title: "Treatments — Shree Sports & Ortho Clinic",
  description:
    "Consultation, sports injury management, joint replacement surgery, ACL and PCL reconstruction and rehabilitation.",
};

export default function TreatmentsPage() {
  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Treatments
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
          What we do about it.
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
          Consultation, surgery and rehabilitation under one roof — assessment, a clear diagnosis
          and a treatment plan built around your work and your goals.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "0 56px",
          maxWidth: 1400,
          borderTop: "1px solid var(--color-divider)",
        }}
      >
        {treatmentDir.map((t) => (
          <Link
            key={t.key}
            href={`/treatments/${t.key}`}
            className="link-card hover-slide"
            style={{ padding: "26px 0 28px", borderBottom: "1px solid var(--color-divider)" }}
          >
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-heading)",
                fontSize: 25,
                letterSpacing: "-0.02em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {t.name}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 15,
                color: "var(--color-neutral-700)",
                lineHeight: 1.55,
                maxWidth: "46ch",
              }}
            >
              {t.blurb}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
