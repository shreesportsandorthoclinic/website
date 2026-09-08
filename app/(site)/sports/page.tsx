import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import { photos, sportsDetail } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sports medicine — Shree Sports & Ortho Clinic",
  description:
    "Injury assessment, treatment and a staged return-to-activity plan for gym, running and field sport injuries.",
};

export default function SportsPage() {
  return (
    <main>
      <section
        className="pad"
        style={{ padding: "70px 48px 60px", background: "var(--color-accent-800)", color: "#ffffff" }}
      >
        <p className="eyebrow" style={{ color: "var(--color-accent-300)", margin: "0 0 20px" }}>
          Sports medicine
        </p>
        <h1
          style={{
            fontSize: "clamp(44px,7vw,104px)",
            letterSpacing: "-0.035em",
            lineHeight: 0.92,
            margin: "0 0 26px",
            maxWidth: "14ch",
            color: "var(--color-neutral-100)",
          }}
        >
          Get back to what you love.
        </h1>
        <p
          style={{
            fontSize: 20,
            lineHeight: 1.5,
            maxWidth: "46ch",
            color: "var(--color-accent-100)",
            margin: "0 0 34px",
          }}
        >
          Injury assessment, treatment and a staged return-to-activity plan built around the sport
          you actually play — not a generic protocol.
        </p>
        <Link className="btn btn-primary" href="/book" style={{ fontSize: 12, padding: "16px 30px" }}>
          Book a sports injury consultation
        </Link>
      </section>

      <section className="pad" style={{ padding: "60px 48px" }}>
        <h2 className="sec-h" style={{ marginBottom: 26 }}>
          By activity
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "0 48px",
            maxWidth: 1400,
          }}
        >
          {sportsDetail.map((s) => (
            <div key={s.name} style={{ padding: "26px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 26,
                  letterSpacing: "-0.02em",
                  fontWeight: 600,
                  margin: "0 0 10px",
                }}
              >
                {s.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                  margin: "0 0 8px",
                }}
              >
                Common injuries
              </p>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--color-neutral-800)",
                  margin: "0 0 14px",
                  lineHeight: 1.5,
                }}
              >
                {s.injuries}
              </p>
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                  margin: "0 0 8px",
                }}
              >
                Return to activity
              </p>
              <p style={{ fontSize: 16, color: "var(--color-neutral-800)", margin: 0, lineHeight: 1.5 }}>
                {s.ret}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-neutral-600)",
            marginTop: 24,
            maxWidth: "70ch",
          }}
        >
          Return-to-activity timelines depend on the specific injury, not the sport. Any timeline
          given here is illustrative; yours is set after assessment.
        </p>
      </section>

      <section className="pad" style={{ padding: "40px 48px 90px" }}>
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            maxWidth: 1400,
            alignItems: "center",
          }}
        >
          <Photo
            photo={{ src: photos.imagingRoom.src, alt: "Imaging and treatment room" }}
            ratio="16/10"
          />
          <div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,44px)",
                letterSpacing: "-0.025em",
                margin: "0 0 20px",
              }}
            >
              Return-to-play is a decision, not a date.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: "44ch", margin: "0 0 20px" }}>
              Clearance is based on what you can demonstrate — range, strength, control and
              confidence — measured against the demands of your sport.
            </p>
            <Link
              className="btn btn-secondary"
              href="/conditions/sports"
              style={{ fontSize: 12, padding: "14px 26px" }}
            >
              Sports injury information
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
