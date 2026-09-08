"use client";

import { useActionState, useState } from "react";
import {
  addClosureAction,
  removeClosureAction,
  saveWeekdayHoursAction,
  type ScheduleActionState,
} from "@/app/staff/actions";
import { minutesToClock } from "@/lib/schedule";
import type { AvailabilityRow } from "@/lib/practice";

type Block = { id: string; date: string; iso: string; detail: string; reason: string };

const START: ScheduleActionState = { ok: false, message: "" };

const timeInput = {
  minHeight: 40,
  borderRadius: 12,
  fontSize: 15,
  width: "auto",
  padding: "6px 10px",
} as const;

function Msg({ state }: { state: ScheduleActionState }) {
  if (!state.message) return null;
  return (
    <span
      style={{
        fontSize: 13,
        color: state.ok ? "var(--color-accent-700)" : "var(--color-accent-2-700)",
      }}
    >
      {state.message}
    </span>
  );
}

function WeekdayRow({ row }: { row: AvailabilityRow }) {
  const [state, action, pending] = useActionState(saveWeekdayHoursAction, START);
  const [open, setOpen] = useState(row.isOpen);

  const morning = row.windows[0];
  const evening = row.windows[1];

  return (
    <tr>
      <td style={{ fontWeight: 600, verticalAlign: "top", paddingTop: 16 }}>{row.day}</td>
      <td colSpan={4} style={{ padding: "10px 8px" }}>
        <form
          action={action}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}
        >
          <input type="hidden" name="weekday" value={row.weekday} />
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              name="isOpen"
              checked={open}
              onChange={(e) => setOpen(e.target.checked)}
            />
            Open
          </label>

          <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Morning</span>
          <input
            type="time"
            name="morningFrom"
            defaultValue={morning ? minutesToClock(morning[0]) : ""}
            disabled={!open}
            style={timeInput}
          />
          <span style={{ color: "var(--color-neutral-500)" }}>–</span>
          <input
            type="time"
            name="morningTo"
            defaultValue={morning ? minutesToClock(morning[1]) : ""}
            disabled={!open}
            style={timeInput}
          />

          <span style={{ fontSize: 13, color: "var(--color-neutral-700)", marginLeft: 8 }}>
            Evening
          </span>
          <input
            type="time"
            name="eveningFrom"
            defaultValue={evening ? minutesToClock(evening[0]) : ""}
            disabled={!open}
            style={timeInput}
          />
          <span style={{ color: "var(--color-neutral-500)" }}>–</span>
          <input
            type="time"
            name="eveningTo"
            defaultValue={evening ? minutesToClock(evening[1]) : ""}
            disabled={!open}
            style={timeInput}
          />

          <button
            className="btn btn-secondary"
            type="submit"
            disabled={pending}
            style={{ fontSize: 12, padding: "9px 18px" }}
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <Msg state={state} />
        </form>
      </td>
    </tr>
  );
}

function AddClosure() {
  const [state, action, pending] = useActionState(addClosureAction, START);
  const [wholeDay, setWholeDay] = useState(true);

  return (
    <form action={action} style={{ display: "grid", gap: 14, maxWidth: 440 }}>
      <div className="field">
        <label htmlFor="cl-date" style={{ fontSize: 13 }}>
          Date
        </label>
        <input
          className="input"
          id="cl-date"
          name="date"
          type="date"
          required
          style={{ minHeight: 44, borderRadius: 14 }}
        />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
        <input
          type="checkbox"
          name="wholeDay"
          checked={wholeDay}
          onChange={(e) => setWholeDay(e.target.checked)}
        />
        Close the whole day
      </label>

      {!wholeDay && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="time" name="from" style={{ ...timeInput, minHeight: 44 }} />
          <span style={{ color: "var(--color-neutral-500)" }}>to</span>
          <input type="time" name="to" style={{ ...timeInput, minHeight: 44 }} />
        </div>
      )}

      <div className="field">
        <label htmlFor="cl-reason" style={{ fontSize: 13 }}>
          Reason (internal)
        </label>
        <input
          className="input"
          id="cl-reason"
          name="reason"
          placeholder="Surgery list / travel / personal"
          style={{ minHeight: 44, borderRadius: 14 }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={pending}
          style={{ fontSize: 12, padding: "12px 22px" }}
        >
          {pending ? "Adding…" : wholeDay ? "Close this day" : "Block this time"}
        </button>
        <Msg state={state} />
      </div>
    </form>
  );
}

export default function AvailabilityEditor({
  rows,
  blocks,
}: {
  rows: AvailabilityRow[];
  blocks: Block[];
}) {
  return (
    <>
      <section style={{ marginBottom: 44 }}>
        <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 8 }}>
          Weekly clinic hours
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
          These drive which 15-minute slots patients can request. Leave the evening blank for a
          single session; untick “Open” to close a weekday entirely.
        </p>
        <table className="table" style={{ fontSize: 15 }}>
          <tbody>
            {rows.map((row) => (
              <WeekdayRow key={row.weekday} row={row} />
            ))}
          </tbody>
        </table>
      </section>

      <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <section>
          <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
            Close a day or block time
          </h2>
          <AddClosure />
        </section>

        <section>
          <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
            Upcoming closures &amp; blocked time
          </h2>
          {blocks.length === 0 ? (
            <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>
              Nothing scheduled. The clinic is open on its normal hours.
            </p>
          ) : (
            <div style={{ borderTop: "1px solid var(--color-divider)" }}>
              {blocks.map((block) => (
                <div
                  key={block.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
                  <span>
                    <span style={{ fontSize: 16 }}>{block.date}</span>
                    <span
                      style={{ display: "block", fontSize: 13, color: "var(--color-neutral-600)" }}
                    >
                      {block.detail}
                      {block.reason ? ` — ${block.reason}` : ""}
                    </span>
                  </span>
                  <form action={removeClosureAction}>
                    <input type="hidden" name="id" value={block.id} />
                    <button
                      className="btn btn-ghost"
                      type="submit"
                      style={{ fontSize: 13, color: "var(--color-accent-2-700)" }}
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
