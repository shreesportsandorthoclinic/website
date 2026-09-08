import Link from "next/link";
import { clinic, legal } from "@/lib/content";

const columns = [
  {
    title: "Care",
    links: [
      { href: "/conditions", label: "Conditions" },
      { href: "/treatments", label: "Treatments" },
      { href: "/sports", label: "Sports medicine" },
      { href: "/work", label: "Work & everyday life" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/library", label: "Health library" },
      { href: "/patients", label: "First visit" },
      { href: "/patients#faqs", label: "FAQs" },
      { href: "/reviews", label: "Reviews" },
    ],
  },
  {
    title: "Clinic",
    links: [
      { href: "/about", label: "About Dr. Neel" },
      { href: "/contact", label: "Visit the clinic" },
      { href: "/book", label: "Book an appointment" },
      { href: "/staff/login", label: "Staff sign in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms & conditions" },
      { href: "/cookies", label: "Cookie policy" },
      { href: "/refund-policy", label: "Refund & cancellation" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer
      className="pad"
      style={{
        padding: "56px 48px 40px",
        borderTop: "1px solid var(--color-divider)",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 36,
          maxWidth: 1400,
          marginBottom: 44,
        }}
      >
        <div>
          <p style={{ fontSize: 19, fontWeight: 600, margin: "0 0 8px" }}>{clinic.name}</p>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-neutral-700)",
              margin: 0,
              maxWidth: "26ch",
            }}
          >
            {clinic.addressLines.join(", ")}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-neutral-700)",
                margin: "0 0 14px",
              }}
            >
              {column.title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 15 }}>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingTop: 20,
          borderTop: "1px solid var(--color-divider)",
          fontSize: 12,
          color: "var(--color-neutral-600)",
        }}
      >
        <span>
          © 2026 {clinic.name}. Information on this site is general and is not a substitute for
          consultation.
        </span>
        <span>
          {legal.legalEntityName} · Clinical establishment reg. {legal.registrationNumber} ·{" "}
          {clinic.addressLines.join(", ")}
        </span>
      </div>
    </footer>
  );
}
