import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import { clinic, getDoctorFacts, photos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dr. Neel — Orthopaedic Surgeon, Shree Sports & Ortho Clinic",
  description:
    "Dr. Nilkumar H. Zalavadia, orthopaedic surgeon at Shree Sports & Ortho Clinic, Electronic City Phase-1, Bengaluru.",
};

/* This page has no other dynamic data, so it would otherwise be
   prerendered once at build time and "Experience" would freeze at that
   year forever. Revalidating daily is more than enough for a value that
   only changes once a year, without paying for full per-request
   rendering. */
export const revalidate = 86400;

export default function AboutPage() {
  const facts = getDoctorFacts();

  return (
    <main>
      <section className="pad" style={{ padding: "40px 48px 60px" }}>
        <div
          className="hero"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "start",
            maxWidth: 1400,
          }}
        >
          <div>
            <p className="eyebrow" style={{ margin: "0 0 18px" }}>
              Orthopaedic Surgeon
            </p>
            <h1
              style={{
                fontSize: "clamp(40px,5vw,68px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                margin: "0 0 10px",
              }}
            >
              {clinic.doctor.name}
            </h1>
            <p style={{ fontSize: 19, color: "var(--color-neutral-700)", margin: "0 0 28px" }}>
              {clinic.doctor.fullName}
            </p>
            <p style={{ fontSize: 21, lineHeight: 1.5, maxWidth: "38ch", margin: "0 0 30px" }}>
              Orthopaedic surgeon at {clinic.name}, Electronic City Phase-1, with 13+ years of
              experience in robotic joint replacement, arthroscopic key-hole surgery of the knee and
              shoulder, and ligament reconstruction.
            </p>
            <Link className="btn btn-primary" href="/book" style={{ fontSize: 12, padding: "15px 28px" }}>
              Book a consultation
            </Link>
          </div>
          <Photo
            photo={photos.doctor}
            ratio="4/5"
            priority
            style={{ maxHeight: "62vh", width: "auto", justifySelf: "end" }}
          />
        </div>
      </section>

      <section className="pad" style={{ padding: "20px 48px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            maxWidth: 1400,
            borderTop: "1px solid var(--color-divider)",
          }}
        >
          {facts.map((fact) => (
            <div
              key={fact.term}
              style={{ padding: "24px 24px 24px 0", borderBottom: "1px solid var(--color-divider)" }}
            >
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-neutral-700)",
                  margin: "0 0 8px",
                }}
              >
                {fact.term}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  color: fact.tbc ? "var(--color-accent-2-700)" : undefined,
                }}
              >
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="pad" style={{ padding: "60px 48px", background: "var(--color-neutral-100)" }}>
        <div
          className="two"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            maxWidth: 1400,
            margin: "0 auto",
            alignItems: "start",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,42px)",
                letterSpacing: "-0.025em",
                margin: "0 0 20px",
              }}
            >
              Approach to treatment
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: "46ch", margin: "0 0 16px" }}>
              The clinic works on a simple sequence: understand the problem properly, agree a plan
              you can actually follow, rebuild strength and movement, and get you back to what you
              were doing before.
            </p>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                maxWidth: "46ch",
                margin: 0,
                color: "var(--color-neutral-800)",
              }}
            >
              That means explaining what is going on in ordinary language, being clear about what is
              known and what is not, and not recommending an intervention because it is available.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Photo
              photo={{ src: photos.consultDesk.src, alt: "Consultation desk with anatomical models" }}
              ratio="3/4"
            />
            <Photo
              photo={{ src: photos.imagingRoom.src, alt: "Imaging room" }}
              ratio="3/4"
              style={{ marginTop: 32 }}
            />
          </div>
        </div>
      </section>

      <section className="pad" style={{ padding: "70px 48px 90px" }}>
        <h2
          style={{
            fontSize: "clamp(28px,3.4vw,42px)",
            letterSpacing: "-0.025em",
            margin: "0 0 34px",
          }}
        >
          Inside the clinic
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 18,
            maxWidth: 1400,
          }}
        >
          <Photo photo={{ src: photos.reception.src, alt: "Reception" }} ratio="4/3" />
          <Photo photo={{ src: photos.waiting1.src, alt: "Waiting area" }} ratio="4/3" />
          <Photo photo={photos.consultRoom} ratio="4/3" />
          <Photo photo={photos.imaging2} ratio="4/3" />
        </div>
      </section>
    </main>
  );
}
