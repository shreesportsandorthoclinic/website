import type { Metadata } from "next";
import Link from "next/link";
import { workChanges, workDetail } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work & everyday life — Shree Sports & Ortho Clinic",
  description:
    "Neck, back and wrist pain from desk work, laptops and long commutes in Electronic City — what causes it and what helps.",
};

export default function WorkPage() {
  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 18px" }}>
        Work &amp; everyday life
      </p>
      <h1
        style={{
          fontSize: "clamp(40px,6vw,88px)",
          letterSpacing: "-0.035em",
          lineHeight: 0.96,
          margin: "0 0 28px",
          maxWidth: "16ch",
        }}
      >
        Your body has to deal with your workday too.
      </h1>
      <p
        style={{
          fontSize: 21,
          lineHeight: 1.5,
          maxWidth: "52ch",
          margin: "0 0 56px",
          color: "var(--color-neutral-800)",
        }}
      >
        An hour each way on Hosur Road, nine hours at a laptop, and a chair that was set up for
        nobody in particular. A large share of the neck, back and wrist pain we see in Electronic
        City starts there.
      </p>

      <div
        className="two"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, maxWidth: 1400 }}
      >
        <div>
          <h2 className="sec-h">What we see most</h2>
          {workDetail.map((w) => (
            <div key={w.name} style={{ padding: "18px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 600,
                  margin: "0 0 6px",
                  letterSpacing: "-0.015em",
                }}
              >
                {w.name}
              </p>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--color-neutral-800)",
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: "44ch",
                }}
              >
                {w.body}
              </p>
            </div>
          ))}
        </div>
        <div>
          <h2 className="sec-h">Changes that usually help</h2>
          <ul className="dotlist" style={{ marginBottom: 34 }}>
            {workChanges.map((item) => (
              <li key={item} style={{ fontSize: 17 }}>
                {item}
              </li>
            ))}
          </ul>
          <div
            style={{
              background: "var(--color-accent-800)",
              color: "#ffffff",
              padding: 28,
              borderRadius: 20,
            }}
          >
            <p style={{ fontSize: 21, lineHeight: 1.3, margin: "0 0 16px", letterSpacing: "-0.015em" }}>
              If it has been going on for weeks, get it assessed rather than adjusting your chair
              again.
            </p>
            <Link className="btn btn-primary" href="/book" style={{ fontSize: 12, padding: "14px 26px" }}>
              Book an appointment
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
