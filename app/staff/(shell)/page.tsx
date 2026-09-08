import type { Metadata } from "next";
import Link from "next/link";
import StatusButton from "@/components/StatusButton";
import StatusTag from "@/components/StatusTag";
import { dashboard, todayLabel } from "@/lib/practice";
import { shortDate } from "@/lib/schedule";

export const metadata: Metadata = { title: "Practice — today" };
export const dynamic = "force-dynamic";

export default async function PracticeDashboard() {
  const { today, upcoming, pending, cancelled, counts } = await dashboard();

  const tiles = [
    { label: "Today", value: counts.today, accent: false },
    { label: "Upcoming", value: counts.upcoming, accent: false },
    { label: "Pending requests", value: counts.pending, accent: true },
    { label: "Cancelled", value: counts.cancelled, accent: false },
    { label: "Slots open today", value: counts.free, accent: false },
  ];

  return (
    <main style={{ padding: "36px 32px 80px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: 0 }}>{todayLabel()}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn btn-secondary" href="/staff/calendar" style={{ fontSize: 12, padding: "12px 22px" }}>
            Open calendar
          </Link>
          <Link className="btn btn-primary" href="/staff/availability" style={{ fontSize: 12, padding: "12px 22px" }}>
            Block time
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 1,
          background: "var(--color-divider)",
          border: "1px solid var(--color-divider)",
          marginBottom: 44,
        }}
      >
        {tiles.map((tile) => (
          <div key={tile.label} style={{ background: "var(--color-bg)", padding: 22 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: tile.accent ? "var(--color-accent-2-700)" : "var(--color-neutral-700)",
                margin: "0 0 10px",
              }}
            >
              {tile.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 40,
                fontWeight: 600,
                margin: 0,
                letterSpacing: "-0.03em",
                color: tile.accent ? "var(--color-accent-2-700)" : undefined,
              }}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: 48 }}>
        <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
          Today&rsquo;s appointments
        </h2>
        {today.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>
            Nothing booked for today.
          </p>
        ) : (
          <table className="table" style={{ fontSize: 15 }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {today.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{a.time}</td>
                  <td>
                    <Link href={`/staff/appointments/${a.id}`} style={{ color: "inherit", fontSize: 16 }}>
                      {a.name}
                    </Link>
                    <span style={{ display: "block", fontSize: 12, color: "var(--color-neutral-600)" }}>
                      {a.age} · {a.phone}
                    </span>
                  </td>
                  <td>{a.type}</td>
                  <td>
                    <StatusTag status={a.status} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link className="btn btn-ghost" href={`/staff/appointments/${a.id}`} style={{ fontSize: 13 }}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <section>
          <h2
            className="sec-h"
            style={{
              color: "var(--color-accent-2-700)",
              borderBottom: "none",
              paddingBottom: 0,
              marginBottom: 16,
            }}
          >
            Pending requests
          </h2>
          {pending.length === 0 ? (
            <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>
              No requests waiting on the clinic.
            </p>
          ) : (
            pending.map((a) => (
              <div
                key={a.id}
                style={{
                  border: "1px solid var(--color-accent-2-300)",
                  padding: 18,
                  marginBottom: 10,
                  borderRadius: 20,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
                  <Link
                    href={`/staff/appointments/${a.id}`}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: 18,
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {a.name}
                  </Link>
                  <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
                    {shortDate(a.date)} · {a.time}
                  </span>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--color-neutral-800)" }}>
                  {a.type} — {a.reason}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <StatusButton
                    id={a.id}
                    status="CONFIRMED"
                    label="Confirm"
                    className="btn btn-primary"
                    style={{ fontSize: 11, padding: "10px 18px" }}
                  />
                  <StatusButton
                    id={a.id}
                    status="RESCHEDULED"
                    label="Reschedule"
                    style={{ fontSize: 11, padding: "10px 18px" }}
                  />
                  <StatusButton
                    id={a.id}
                    status="CANCELLED"
                    label="Decline"
                    style={{
                      fontSize: 11,
                      padding: "10px 18px",
                      borderColor: "var(--color-accent-2-400)",
                      color: "var(--color-accent-2-700)",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </section>

        <section>
          <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
            Upcoming
          </h2>
          <table className="table" style={{ fontSize: 15 }}>
            <tbody>
              {upcoming.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{shortDate(a.date)}</td>
                  <td>{a.time}</td>
                  <td>
                    <Link href={`/staff/appointments/${a.id}`} style={{ color: "inherit" }}>
                      {a.name}
                    </Link>
                  </td>
                  <td>
                    <StatusTag status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2
            className="sec-h"
            style={{ borderBottom: "none", paddingBottom: 0, margin: "32px 0 16px" }}
          >
            Cancelled &amp; no-shows
          </h2>
          <table className="table" style={{ fontSize: 15 }}>
            <tbody>
              {cancelled.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{shortDate(a.date)}</td>
                  <td>{a.time}</td>
                  <td>
                    <Link href={`/staff/appointments/${a.id}`} style={{ color: "inherit" }}>
                      {a.name}
                    </Link>
                  </td>
                  <td>
                    <StatusTag status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
