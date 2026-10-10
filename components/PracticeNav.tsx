"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clinic } from "@/lib/content";

const items = [
  { href: "/staff", label: "Dashboard" },
  { href: "/staff/calendar", label: "Calendar" },
  { href: "/staff/consult", label: "Consult" },
  { href: "/staff/billing", label: "Billing" },
  { href: "/staff/availability", label: "Availability" },
  { href: "/staff/prices", label: "Prices" },
  { href: "/staff/library", label: "Library" },
  { href: "/staff/notifications", label: "Notifications" },
];

// "/staff/billing/12" belongs to Billing; "/staff" only matches itself.
function isActive(pathname: string, href: string) {
  if (href === "/staff") return pathname === "/staff";
  return pathname === href || pathname.startsWith(href + "/");
}

const pill = {
  fontFamily: "var(--font-heading)",
  fontSize: 13,
  padding: "8px 14px",
  border: "1px solid var(--color-neutral-700)",
  borderRadius: 20,
  textDecoration: "none",
  background: "transparent",
  color: "var(--color-accent-100)",
  cursor: "pointer",
} as const;

export default function PracticeNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = items.find((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function signOut() {
    await fetch("/api/staff/login", { method: "DELETE" }).catch(() => {});
    router.replace("/staff/login");
    router.refresh();
  }

  const logo = (
    <img
      src="/images/logo.jpeg"
      alt=""
      style={{
        height: 34,
        width: "auto",
        display: "block",
        flex: "none",
        background: "#ffffff",
        borderRadius: 8,
        padding: 4,
      }}
    />
  );

  return (
    <div
      className="no-print"
      style={{
        background: "var(--color-accent-800)",
        color: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* — desktop: everything in one row — */}
      <div
        className="pnav-desk"
        style={{ alignItems: "center", gap: 24, padding: "14px 32px", flexWrap: "wrap" }}
      >
        <Link
          href="/staff"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: "auto",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {logo}
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17 }}>
            {clinic.shortName}{" "}
            <span style={{ color: "var(--color-neutral-500)", fontWeight: 400 }}>· Practice</span>
          </span>
        </Link>

        {items.map((item) => {
          const active = isActive(pathname, item.href);
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
        <Link href="/" style={pill}>
          View site
        </Link>
        <button type="button" onClick={signOut} style={pill}>
          Sign out
        </button>
      </div>

      {/* — mobile: slim bar + menu sheet — */}
      <div className="pnav-mob" style={{ flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
          <Link href="/staff" aria-label="Dashboard" style={{ display: "flex" }}>
            {logo}
          </Link>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 17,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {current?.label ?? "Practice"}
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="pnav-sheet"
            style={{ ...pill, padding: "9px 16px", fontSize: 14, minHeight: 40 }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open && (
          <nav
            id="pnav-sheet"
            style={{
              padding: "4px 16px 16px",
              borderTop: "1px solid var(--color-neutral-800)",
              maxHeight: "calc(100vh - 60px)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 12,
              }}
            >
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 15,
                      padding: "14px 14px",
                      borderRadius: 12,
                      textDecoration: "none",
                      background: active ? "var(--color-bg)" : "rgba(255,255,255,0.06)",
                      color: active ? "var(--color-accent-800)" : "#ffffff",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Link href="/" style={{ ...pill, flex: 1, textAlign: "center", padding: "11px 14px" }}>
                View site
              </Link>
              <button
                type="button"
                onClick={signOut}
                style={{ ...pill, flex: 1, padding: "11px 14px" }}
              >
                Sign out
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
