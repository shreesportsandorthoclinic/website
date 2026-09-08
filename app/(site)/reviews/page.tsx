import type { Metadata } from "next";
import GoogleReviews from "@/components/GoogleReviews";
import { profiles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reviews — Shree Sports & Ortho Clinic",
  description:
    "Patient reviews of Shree Sports & Ortho Clinic, shown straight from the clinic's Google Business profile.",
};

const platforms = [
  { label: "View all on Google", href: profiles.googleMaps },
  { label: "View all on Practo", href: profiles.practo },
  { label: "View all on JustDial", href: profiles.justdial },
];

export default function ReviewsPage() {
  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Reviews
      </p>
      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "end",
          maxWidth: 1400,
          marginBottom: 44,
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
          What patients say.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-neutral-700)",
            margin: 0,
            maxWidth: "46ch",
          }}
        >
          These reviews were written by members of the public who came to the clinic. They are shown
          here straight from the clinic&rsquo;s Google Business profile, word for word. Nothing on
          this page is written, edited, selected or paid for by the clinic.
        </p>
      </div>

      <div style={{ maxWidth: 1400, marginBottom: 36 }}>
        <GoogleReviews />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        {platforms.map((platform) => (
          <a
            key={platform.label}
            className="btn btn-secondary"
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, padding: "14px 26px" }}
          >
            {platform.label}
          </a>
        ))}
      </div>
    </main>
  );
}
