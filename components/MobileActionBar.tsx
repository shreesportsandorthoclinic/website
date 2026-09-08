import Link from "next/link";
import { clinic } from "@/lib/content";

const base = {
  flex: 1,
  minHeight: 56,
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  textDecoration: "none",
  fontFamily: "var(--font-heading)",
  fontSize: 13,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

export default function MobileActionBar() {
  return (
    <div
      className="mob"
      style={{
        display: "none",
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: "var(--color-text)",
        color: "var(--color-bg)",
      }}
    >
      <a href={`tel:${clinic.phone}`} style={{ ...base, color: "inherit" }}>
        Call
      </a>
      <Link
        href="/contact"
        style={{ ...base, color: "inherit", borderLeft: "1px solid var(--color-neutral-700)" }}
      >
        Directions
      </Link>
      <Link
        href="/book"
        style={{
          ...base,
          flex: 1.3,
          background: "var(--color-accent)",
          color: "var(--color-bg)",
        }}
      >
        Book
      </Link>
    </div>
  );
}
