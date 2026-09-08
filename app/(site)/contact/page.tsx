import type { Metadata } from "next";
import Link from "next/link";
import MapEmbed from "@/components/MapEmbed";
import Photo from "@/components/Photo";
import { clinic, photos, profiles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Visit the clinic — Shree Sports & Ortho Clinic",
  description:
    "Neeladri Layout, Doddathoguru, Electronic City Phase-1, Bengaluru 560100. Clinic hours, directions and contact details.",
};

const rows = [
  { term: "Phone", value: clinic.phone, href: `tel:${clinic.phone}` },
  { term: "WhatsApp", value: clinic.whatsapp, href: `https://wa.me/91${clinic.whatsapp}` },
  { term: "Email", value: clinic.email, href: `mailto:${clinic.email}` },
  { term: "Clinic", value: "08:00–14:00 & 19:00–21:00", href: undefined },
  { term: "Manipal ECity", value: "14:00–19:00", href: undefined },
];

export default function ContactPage() {
  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Contact
      </p>
      <h1
        style={{
          fontSize: "clamp(38px,5.4vw,74px)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          margin: "0 0 52px",
          maxWidth: "14ch",
        }}
      >
        Visit the clinic.
      </h1>

      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 56,
          maxWidth: 1400,
          alignItems: "start",
        }}
      >
        <div>
          <address style={{ fontStyle: "normal", fontSize: 22, lineHeight: 1.55, margin: "0 0 32px" }}>
            {clinic.name}
            {clinic.addressLines.map((line) => (
              <span key={line}>
                <br />
                {line}
              </span>
            ))}
          </address>

          <dl style={{ margin: "0 0 32px", display: "grid", borderTop: "1px solid var(--color-divider)" }}>
            {rows.map((row) => (
              <div key={row.term} className="dl-row">
                <dt>{row.term}</dt>
                <dd style={{ textAlign: "right" }}>
                  {row.href ? (
                    <a href={row.href} style={{ color: "var(--color-accent-700)" }}>
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
            <a
              className="btn btn-primary"
              href={profiles.googleMaps}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, padding: "14px 26px" }}
            >
              Get directions
            </a>
            <a
              className="btn btn-secondary"
              href={`tel:${clinic.phone}`}
              style={{ fontSize: 12, padding: "14px 26px" }}
            >
              Call clinic
            </a>
            <a
              className="btn btn-secondary"
              href={`https://wa.me/91${clinic.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, padding: "14px 26px" }}
            >
              WhatsApp
            </a>
          </div>

          <Link
            className="btn btn-primary btn-block"
            href="/book"
            style={{ fontSize: 12, padding: "16px 28px" }}
          >
            Book an appointment
          </Link>
        </div>

        <div>
          <MapEmbed />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Photo photo={{ src: photos.reception.src, alt: "Reception at the clinic" }} ratio="4/3" />
            <Photo photo={{ src: photos.lounge.src, alt: "Waiting lounge" }} ratio="4/3" />
          </div>

          <Photo photo={photos.exterior} ratio="16/11" style={{ marginTop: 16 }} />
        </div>
      </div>
    </main>
  );
}
