"use client";

import Link from "next/link";
import { useState } from "react";
import { blockSlotAction, removeClosureAction } from "@/app/staff/actions";
import StatusTag from "@/components/StatusTag";
import type { MonthCell, WeekColumn, WeekSlot } from "@/lib/practice";
import type { Appointment } from "@/lib/types";

type DayRow = {
  time: string;
  appointment: Appointment | null;
  blocked: boolean;
  closureId: string | null;
};
type View = "day" | "week" | "month";

/* One palette for both the week grid and its legend, so they can never drift:
   green = booked, white = open, red = blocked. */
const SLOT_INK: Record<WeekSlot["state"], { background: string; color: string; border: string }> = {
  booked: {
    background: "var(--color-accent-600)",
    color: "#ffffff",
    border: "1px solid var(--color-accent-600)",
  },
  open: {
    background: "var(--color-bg)",
    color: "var(--color-neutral-700)",
    border: "1px solid var(--color-divider)",
  },
  blocked: {
    background: "var(--color-accent-2-600)",
    color: "#ffffff",
    border: "1px solid var(--color-accent-2-600)",
  },
};

const LEGEND: Array<{ state: WeekSlot["state"]; label: string }> = [
  { state: "booked", label: "Booked" },
  { state: "open", label: "Open" },
  { state: "blocked", label: "Blocked" },
];

function Legend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 18,
        marginTop: 16,
        fontSize: 13,
        color: "var(--color-neutral-700)",
      }}
    >
      {LEGEND.map(({ state, label }) => (
        <span key={state} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            aria-hidden
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: SLOT_INK[state].background,
              border: SLOT_INK[state].border,
            }}
          />
          {label}
        </span>
      ))}
      <span>Each cell is one 15-minute slot.</span>
    </div>
  );
}

export default function CalendarViews({
  dayRows,
  weekColumns,
  monthCells,
  dayIso,
  dayLabel,
  prevDate,
  nextDate,
  isToday,
}: {
  dayRows: DayRow[];
  weekColumns: WeekColumn[];
  monthCells: MonthCell[];
  dayIso: string;
  dayLabel: string;
  prevDate: string;
  nextDate: string;
  isToday: boolean;
}) {
  const [view, setView] = useState<View>("day");

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: 0 }}>Appointment calendar</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="seg">
            {(["Day", "Week", "Month"] as const).map((label) => {
              const value = label.toLowerCase() as View;
              const on = view === value;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setView(value)}
                  style={{
                    background: on ? "var(--color-accent)" : "transparent",
                    color: on ? "var(--color-bg)" : "var(--color-text)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Link
            className="btn btn-secondary"
            href="/staff/availability"
            style={{ fontSize: 12, padding: "12px 22px" }}
          >
            Manage availability
          </Link>
        </div>
      </div>

      {view === "day" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "0 0 16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              className="btn btn-ghost"
              href={`/staff/calendar?date=${prevDate}`}
              style={{ fontSize: 16, padding: "4px 10px" }}
              aria-label="Previous day"
            >
              ‹
            </Link>
            <span
              style={{
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-neutral-700)",
              }}
            >
              {dayLabel} · Dr. Neel
            </span>
            <Link
              className="btn btn-ghost"
              href={`/staff/calendar?date=${nextDate}`}
              style={{ fontSize: 16, padding: "4px 10px" }}
              aria-label="Next day"
            >
              ›
            </Link>
            {!isToday && (
              <Link className="btn btn-ghost" href="/staff/calendar" style={{ fontSize: 13 }}>
                Today
              </Link>
            )}
          </div>
          {dayRows.length === 0 && (
            <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>
              The clinic is closed on this day. Manage hours and closures under{" "}
              <Link href="/staff/availability" style={{ color: "var(--color-accent-700)" }}>
                Availability
              </Link>
              .
            </p>
          )}
          <div style={{ borderTop: "1px solid var(--color-divider)", maxWidth: 900 }}>
            {dayRows.map((row) => (
              <div
                key={row.time}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: 20,
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--color-neutral-700)",
                  }}
                >
                  {row.time}
                </span>
                <span>
                  <span
                    style={{
                      fontSize: 17,
                      fontFamily: "var(--font-heading)",
                      color:
                        !row.appointment && row.blocked
                          ? "var(--color-accent-2-700)"
                          : "var(--color-text)",
                    }}
                  >
                    {row.appointment ? row.appointment.name : row.blocked ? "Busy" : "Open"}
                  </span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--color-neutral-600)" }}>
                    {row.appointment?.type ?? (row.blocked ? "Blocked — not offered to patients" : "")}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {row.appointment ? (
                    <>
                      <StatusTag status={row.appointment.status} />
                      <Link
                        className="btn btn-ghost"
                        href={`/staff/appointments/${row.appointment.id}`}
                        style={{ fontSize: 13 }}
                      >
                        Open
                      </Link>
                    </>
                  ) : row.blocked ? (
                    /* Only a closure that is exactly this slot can be lifted from
                       here — a wider blocked range belongs to /staff/availability. */
                    row.closureId ? (
                      <form action={removeClosureAction}>
                        <input type="hidden" name="id" value={row.closureId} />
                        <button
                          className="btn btn-ghost"
                          type="submit"
                          style={{ fontSize: 13, color: "var(--color-neutral-600)" }}
                        >
                          Unblock
                        </button>
                      </form>
                    ) : (
                      <Link
                        className="btn btn-ghost"
                        href="/staff/availability"
                        style={{ fontSize: 13, color: "var(--color-neutral-600)" }}
                      >
                        Manage
                      </Link>
                    )
                  ) : (
                    <form action={blockSlotAction}>
                      <input type="hidden" name="date" value={dayIso} />
                      <input type="hidden" name="time" value={row.time} />
                      <button
                        className="btn btn-ghost"
                        type="submit"
                        style={{ fontSize: 13, color: "var(--color-neutral-600)" }}
                      >
                        Block
                      </button>
                    </form>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "week" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 1,
              background: "var(--color-divider)",
              border: "1px solid var(--color-divider)",
            }}
          >
            {weekColumns.map((column) => (
              <div
                key={column.iso}
                style={{
                  background: column.today ? "var(--color-accent-100)" : "var(--color-bg)",
                  padding: 12,
                  minHeight: 280,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-neutral-700)",
                    margin: "0 0 4px",
                  }}
                >
                  {column.name}
                </p>
                <p style={{ fontSize: 15, margin: "0 0 2px" }}>{column.booked} booked</p>
                <p style={{ fontSize: 13, color: "var(--color-neutral-600)", margin: "0 0 12px" }}>
                  {column.closed
                    ? "Closed"
                    : `${column.open} open${column.blocked ? ` · ${column.blocked} blocked` : ""}`}
                </p>
                <div style={{ display: "grid", gap: 2 }}>
                  {column.slots.map((slot) => (
                    <span
                      key={slot.time}
                      title={`${slot.time} — ${slot.state}`}
                      style={{
                        ...SLOT_INK[slot.state],
                        display: "block",
                        padding: "2px 5px",
                        borderRadius: 4,
                        fontSize: 10.5,
                        lineHeight: 1.5,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slot.time}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Legend />
        </>
      )}

      {view === "month" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 1,
            background: "var(--color-divider)",
            border: "1px solid var(--color-divider)",
          }}
        >
          {monthCells.map((cell, i) =>
            cell.blank ? (
              <div key={`b${i}`} style={{ background: "var(--color-bg)", minHeight: 104 }} />
            ) : (
              <div
                key={cell.day}
                style={{
                  background: cell.today ? "var(--color-accent-100)" : "var(--color-bg)",
                  minHeight: 104,
                  padding: 10,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-heading)",
                    fontSize: 17,
                    color: cell.closed ? "var(--color-neutral-500)" : "var(--color-text)",
                  }}
                >
                  {cell.day}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--color-neutral-600)",
                    marginTop: 6,
                  }}
                >
                  {cell.closed ? "Closed" : cell.count === 0 ? "—" : `${cell.count} appts`}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
}
