"use client";

import Link from "next/link";
import { useState } from "react";
import StatusTag from "@/components/StatusTag";
import type { MonthCell } from "@/lib/practice";
import type { Appointment } from "@/lib/types";

type DayRow = { time: string; appointment: Appointment | null };
type WeekColumn = { name: string; capacity: number; booked: number; open: number; today: boolean };
type View = "day" | "week" | "month";

export default function CalendarViews({
  dayRows,
  weekColumns,
  monthCells,
}: {
  dayRows: DayRow[];
  weekColumns: WeekColumn[];
  monthCells: MonthCell[];
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
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              margin: "0 0 16px",
            }}
          >
            Wednesday 2 September · Dr. Neel
          </p>
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
                  <span style={{ fontSize: 17, fontFamily: "var(--font-heading)" }}>
                    {row.appointment ? row.appointment.name : "Open"}
                  </span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--color-neutral-600)" }}>
                    {row.appointment?.type ?? ""}
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
                  ) : (
                    <button
                      className="btn btn-ghost"
                      type="button"
                      style={{ fontSize: 13, color: "var(--color-neutral-600)" }}
                    >
                      Block
                    </button>
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
                key={column.name}
                style={{
                  background: column.today ? "var(--color-accent-100)" : "var(--color-bg)",
                  padding: 16,
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
                <p style={{ fontSize: 15, margin: "0 0 4px" }}>{column.booked} booked</p>
                <p style={{ fontSize: 13, color: "var(--color-neutral-600)", margin: "0 0 14px" }}>
                  {column.open} open
                </p>
                <div style={{ display: "grid", gap: 3 }}>
                  {Array.from({ length: column.capacity }).map((_, j) => (
                    <span
                      key={j}
                      style={{
                        height: 9,
                        display: "block",
                        background:
                          j < column.booked ? "var(--color-accent)" : "var(--color-neutral-200)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-600)", marginTop: 14 }}>
            Each bar is one 30-minute slot. Filled bars are booked.
          </p>
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
