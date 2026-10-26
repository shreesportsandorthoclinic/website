"use client";

import { useActionState } from "react";
import { emailBillAction, type BillingActionState } from "@/app/staff/billing-actions";

const START: BillingActionState = { ok: false, message: "" };

/** Emails this bill to the patient. Prefilled with the booking's email when
    the visit came from an appointment; walk-ins type one in. */
export default function EmailBill({ visitId, defaultEmail }: { visitId: string; defaultEmail: string }) {
  const [state, action, pending] = useActionState(emailBillAction, START);
  return (
    <form action={action} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={visitId} />
      <input
        className="input"
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
        placeholder="Patient's email"
        aria-label="Patient's email"
        style={{ width: 260, borderRadius: 10 }}
      />
      <button className="btn btn-secondary" type="submit" disabled={pending} style={{ fontSize: 12, padding: "12px 22px" }}>
        {pending ? "Sending…" : "Send by email"}
      </button>
      {state.message && (
        <span style={{ fontSize: 13, color: state.ok ? "var(--color-accent-700)" : "var(--color-accent-2-700)" }}>
          {state.message}
        </span>
      )}
    </form>
  );
}
