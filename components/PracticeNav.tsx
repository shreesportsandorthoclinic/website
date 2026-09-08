"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clinic } from "@/lib/content";

const items = [
  { href: "/staff", label: "Dashboard" },
  { href: "/staff/calendar", label: "Calendar" },
  { href: "/staff/availability", label: "Availability" },
  { href: "/staff/library", label: "Library" },
  { href: "/staff/notifications", label: "Notifications" },
];

export default function PracticeNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/staff/login", { method: "DELETE" }).catch(() => {});
    router.replace("/staff/login");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "14px 32px",
        background: "var(--color-accent-800)",
        color: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 17,
          marginRight: "auto",
        }}
      >
        {clinic.shortName}{" "}
        <span style={{ color: "var(--color-neutral-500)", fontWeight: 400 }}>· Practice</span>
      </span>

      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 13,
              letterSpacing: "0.06em",
              padding: "8px 14px",
              borderRadius: 20,
              textDecoration: "none",
              background: active ? "var(--color-neutral-800)" : "transparent",
              color: active ? "var(--color-bg)" : "var(--color-neutral-400)",
            }}
          >
            {item.label}
          </Link>
        );
      })}

      <span style={{ width: 1, height: 22, background: "var(--color-neutral-700)" }} />
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 13,
          padding: "8px 14px",
          border: "1px solid var(--color-neutral-700)",
          borderRadius: 20,
          textDecoration: "none",
          background: "transparent",
          color: "var(--color-accent-100)",
        }}
      >
        View site
      </Link>
      <button
        type="button"
        onClick={signOut}
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 13,
          padding: "8px 14px",
          border: "1px solid var(--color-neutral-700)",
          borderRadius: 20,
          background: "transparent",
          color: "var(--color-accent-100)",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
