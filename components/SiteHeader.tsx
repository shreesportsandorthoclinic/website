"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clinic } from "@/lib/content";

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/conditions", label: "Conditions" },
  { href: "/treatments", label: "Treatments" },
  { href: "/about", label: "About" },
  { href: "/library", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

const mobileNav = [
  { href: "/", label: "Home" },
  { href: "/conditions", label: "Conditions" },
  { href: "/treatments", label: "Treatments" },
  { href: "/about", label: "About Dr. Neel" },
  { href: "/sports", label: "Sports Medicine" },
  { href: "/library", label: "Health Library" },
  { href: "/patients", label: "Patient Information" },
  { href: "/contact", label: "Visit the Clinic" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOn = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--color-bg)" }}>
      <div
        className="pad"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          padding: "7px 48px",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: "#2e8778",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <span>{clinic.locality}</span>
        <span className="desk">
          CLINIC {clinic.hours.clinic.replace(" · ", " & ")} · MANIPAL ECITY {clinic.hours.manipal}
        </span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>{clinic.motto}</span>
      </div>

      <div
        className="pad"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 36,
          padding: "14px 48px 16px",
          borderBottom: "1px solid var(--color-divider)",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            marginRight: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <img
            src="/images/logo.jpeg"
            alt=""
            width={47}
            height={60}
            style={{ height: 60, width: 47, objectFit: "cover", display: "block" }}
          />
          <span>
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {clinic.shortName}
            </span>
            <span
              className="sub"
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--color-neutral-600)",
                marginTop: 2,
              }}
            >
              {clinic.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="desk"
          style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 15 }}
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                color: isOn(item.href) ? "var(--color-accent-700)" : "inherit",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="btn btn-primary"
            href="/book"
            style={{ fontSize: 12, padding: "12px 22px" }}
          >
            Book Appointment
          </Link>
        </nav>

        <button
          type="button"
          className="mob btn btn-secondary"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          style={{
            display: "none",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 20px 20px",
            gap: 2,
            borderBottom: "1px solid var(--color-divider)",
            background: "var(--color-bg)",
          }}
        >
          {mobileNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: "none",
                color: "inherit",
                padding: "12px 0",
                borderBottom:
                  i === mobileNav.length - 1 ? undefined : "1px solid var(--color-divider)",
                fontSize: 19,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
