"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  addChargeAction,
  markPaidAction,
  removeChargeAction,
  type BillingActionState,
} from "@/app/staff/billing-actions";
import {
  PAYMENT_LABEL,
  PAYMENT_METHODS,
  rupees,
  subtotal,
  type PaymentMethod,
  type Visit,
} from "@/lib/billing-shared";

const START: BillingActionState = { ok: false, message: "" };

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
  fontSize: 15,
  fontVariantNumeric: "tabular-nums",
};

function sentAt(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export default function BillCard({ visit }: { visit: Visit }) {
  const [payState, pay, paying] = useActionState(markPaidAction, START);
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const gross = subtotal(visit.items);
  const off = Math.max(Number(discount) || 0, 0);
  const due = Math.max(gross - off, 0);

  return (
    <article
      style={{
        border: "1.5px solid var(--color-accent-2-300)",
        borderRadius: 20,
        padding: 20,
        background: "var(--color-bg)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>{visit.patientName}</span>
        <span style={{ fontSize: 13, color: "var(--color-neutral-600)", whiteSpace: "nowrap" }}>
          sent {sentAt(visit.createdAt)}
        </span>
      </header>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--color-neutral-600)" }}>
        {[visit.patientAge && `${visit.patientAge} yrs`, visit.patientPhone].filter(Boolean).join(" · ") || "Walk-in"}
      </p>

      {visit.doctorNote && (
        <p
          style={{
            margin: "0 0 14px",
            padding: "10px 12px",
            borderRadius: 12,
            background: "var(--color-accent-100)",
            fontSize: 14,
          }}
        >
          <strong style={{ fontSize: 12, letterSpacing: "0.06em" }}>DOCTOR&rsquo;S NOTE · </strong>
          {visit.doctorNote}
        </p>
      )}

      <div style={{ display: "grid", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--color-divider)" }}>
        {visit.items.map((line, index) => (
          <div key={index} style={row}>
            <span>
              {line.name}
              {line.qty > 1 && <span style={{ color: "var(--color-neutral-600)" }}> × {line.qty}</span>}
              {line.byReception && (
                <form action={removeChargeAction} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={visit.id} />
                  <input type="hidden" name="index" value={index} />
                  <button
                    type="submit"
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: "0 6px", minHeight: 0, color: "var(--color-accent-2-700)" }}
                    aria-label={`Remove ${line.name}`}
                  >
                    remove
                  </button>
                </form>
              )}
            </span>
            <span>{rupees(line.price * line.qty)}</span>
          </div>
        ))}
      </div>

      <AddCharge id={visit.id} />

      <form action={pay}>
        <input type="hidden" name="id" value={visit.id} />
        <input type="hidden" name="method" value={method ?? ""} />

        <div style={{ ...row, marginTop: 12, alignItems: "center" }}>
          <label htmlFor={`disc-${visit.id}`} style={{ fontSize: 14 }}>
            Discount
          </label>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            ₹
            <input
              className="input"
              id={`disc-${visit.id}`}
              name="discount"
              type="number"
              min={0}
              max={gross}
              step={1}
              inputMode="numeric"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={{ width: 100, textAlign: "right", borderRadius: 10 }}
            />
          </span>
        </div>

        <div style={{ ...row, margin: "14px 0 16px", fontSize: 22, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
          <span>To pay</span>
          <span>{rupees(due)}</span>
        </div>

        <div className="seg" role="group" aria-label="Paid by" style={{ display: "flex", marginBottom: 12 }}>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              aria-pressed={method === m}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                font: "inherit",
                fontSize: 14,
                cursor: "pointer",
                background: method === m ? "var(--color-accent)" : "var(--color-bg)",
                color: method === m ? "#ffffff" : "var(--color-text)",
              }}
            >
              {PAYMENT_LABEL[m]}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!method || paying || off > gross}
            style={{ fontSize: 12, padding: "12px 22px" }}
          >
            {paying ? "Saving…" : method ? `Mark paid · ${PAYMENT_LABEL[method]}` : "Choose how they paid"}
          </button>
          <Link className="btn btn-ghost" href={`/staff/billing/${visit.id}`} style={{ fontSize: 13 }}>
            Preview bill
          </Link>
        </div>
        {payState.message && !payState.ok && (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-accent-2-700)" }}>{payState.message}</p>
        )}
      </form>
    </article>
  );
}

function AddCharge({ id }: { id: string }) {
  const [state, action, pending] = useActionState(addChargeAction, START);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen(true)}
        style={{ fontSize: 13, marginTop: 6 }}
      >
        + Add a charge
      </button>
    );
  }

  return (
    <form action={action} style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
      <input type="hidden" name="id" value={id} />
      <input className="input" name="name" placeholder="e.g. Knee brace" required style={{ flex: "1 1 140px", borderRadius: 10 }} />
      <input
        className="input"
        name="price"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        placeholder="₹"
        required
        style={{ width: 90, borderRadius: 10 }}
      />
      <button className="btn btn-secondary" type="submit" disabled={pending} style={{ fontSize: 12, padding: "8px 14px" }}>
        Add
      </button>
      {state.message && !state.ok && (
        <span style={{ fontSize: 13, color: "var(--color-accent-2-700)", flexBasis: "100%" }}>{state.message}</span>
      )}
    </form>
  );
}
