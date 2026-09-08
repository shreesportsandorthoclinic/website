export const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO-SHOW",
] as const;

export type Status = (typeof STATUSES)[number];

export type Appointment = {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  /** Display label, e.g. "New consultation". */
  type: string;
  /** ISO date, e.g. "2026-09-02". */
  date: string;
  /** Slot label as shown to patients, e.g. "11:00 AM". */
  time: string;
  status: Status;
  reason: string;
  history: string;
  reference: string;
  createdAt: string;
  /** Staff-entered clinical notes. */
  notes?: string;
};

export type NewAppointment = Omit<
  Appointment,
  "id" | "reference" | "createdAt" | "status" | "notes"
> & {
  status?: Status;
};

/** A booking occupies its slot unless it has been cancelled or missed. */
export function occupiesSlot(status: Status) {
  return status !== "CANCELLED" && status !== "NO-SHOW";
}
