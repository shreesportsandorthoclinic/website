"use client";

import { useActionState, useEffect, useState } from "react";
import {
  rescheduleAppointmentAction,
  type ScheduleActionState,
} from "@/app/staff/actions";
import type { Slot } from "@/lib/schedule";

const START: ScheduleActionState = { ok: false, message: "" };

/** Date + slot picker for moving an appointment, on
    /staff/appointments/[id]. Slots reload from /api/staff/slots whenever the
    date changes, so the list always reflects live hours, closures and what
    else is booked that day — the appointment's own current slot is excluded
    from "taken" so keeping the same time is still an option. */
export default function RescheduleForm({
  id,
  currentDate,
  currentTime,
}: {
  id: string;
  currentDate: string;
  currentTime: string;
}) {
  const [state, action, pending] = useActionState(rescheduleAppointmentAction, START);
  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !date) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/staff/slots?date=${date}&excludeId=${id}`)
      .then((res) => res.json())
      .then((data: { slots?: Slot[]; closed?: boolean }) => {
        if (cancelled) return;
        setSlots(data.slots ?? []);
        setClosed(Boolean(data.closed));
        /* Keep the current selection if it is still on the list; otherwise
           default to the first free slot so the form never submits empty. */
        const stillThere = (data.slots ?? []).some((s) => s.time === time);
        if (!stillThere) {
          const firstFree = (data.slots ?? []).find((s) => !s.taken);
          setTime(firstFree ? firstFree.time : "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setClosed(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date, id]);

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(true)}
        style={{ fontSize: 12, padding: "14px 24px", width: "100%" }}
      >
        Reschedule
      </button>
    );
  }

  return (
    <form
      action={action}
      style={{
        display: "grid",
        gap: 10,
        border: "1px solid var(--color-divider)",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <input type="hidden" name="id" value={id} />
      <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>Reschedule</p>

      <input
        className="input"
        type="date"
        name="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ minHeight: 40, borderRadius: 10, fontSize: 14 }}
      />

      <select
        className="input"
        name="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        disabled={loading || closed || slots.length === 0}
        style={{ minHeight: 40, borderRadius: 10, fontSize: 14 }}
      >
        {loading && <option value="">Loading…</option>}
        {!loading && closed && <option value="">Clinic closed that day</option>}
        {!loading &&
          !closed &&
          slots.map((slot) => (
            <option key={slot.time} value={slot.time} disabled={slot.taken}>
              {slot.time}
              {slot.taken ? " — taken" : ""}
            </option>
          ))}
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={pending || loading || closed || !time}
          style={{ fontSize: 12, padding: "10px 18px", flex: 1 }}
        >
          {pending ? "Saving…" : "Confirm new time"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setOpen(false)}
          style={{ fontSize: 12, padding: "10px 14px" }}
        >
          Cancel
        </button>
      </div>

      {state.message && (
        <span
          style={{
            fontSize: 12,
            color: state.ok ? "var(--color-accent-700)" : "var(--color-accent-2-700)",
          }}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
