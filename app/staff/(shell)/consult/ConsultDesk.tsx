"use client";

import { useActionState, useEffect, useState } from "react";
import {
  sendVisitAction,
  voidVisitAction,
  type BillingActionState,
} from "@/app/staff/billing-actions";
import {
  CATEGORY_LABEL,
  rupees,
  totalDue,
  type Category,
  type PriceItem,
  type Visit,
} from "@/lib/billing-shared";
import VisitStatusTag from "@/components/VisitStatusTag";

type Patient = { id: string; name: string; phone: string; age: string; time: string; type: string };

const START: BillingActionState = { ok: false, message: "" };

const chip = (on: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 14,
  border: `1.5px solid ${on ? "var(--color-accent)" : "var(--color-divider)"}`,
  background: on ? "var(--color-accent-100)" : "var(--color-bg)",
  color: "var(--color-text)",
  font: "inherit",
  fontSize: 15,
  cursor: "pointer",
  textAlign: "left",
});

const priceInk: React.CSSProperties = {
  fontSize: 13,
  color: "var(--color-neutral-600)",
  fontVariantNumeric: "tabular-nums",
};

export default function ConsultDesk({
  appointments,
  prices,
  visits,
}: {
  appointments: Patient[];
  prices: Record<Category, PriceItem[]>;
  visits: Visit[];
}) {
  /* Remount the form after each successful send so every field starts clean. */
  const [round, setRound] = useState(0);
  const sentFor = new Set(visits.filter((v) => v.status !== "VOID").map((v) => v.appointmentId));

  return (
    <div
      className="two"
      style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 48, alignItems: "start" }}
    >
      <VisitForm
        key={round}
        appointments={appointments}
        sentFor={sentFor}
        prices={prices}
        onSent={() => setRound((r) => r + 1)}
      />
      <SentToday visits={visits} />
    </div>
  );
}

function VisitForm({
  appointments,
  sentFor,
  prices,
  onSent,
}: {
  appointments: Patient[];
  sentFor: Set<string | null>;
  prices: Record<Category, PriceItem[]>;
  onSent: () => void;
}) {
  const [state, action, pending] = useActionState(sendVisitAction, START);
  const [patientId, setPatientId] = useState<string>("");
  const [patient, setPatient] = useState({ name: "", phone: "", age: "" });
  const [consultation, setConsultation] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});

  useEffect(() => {
    if (state.ok) onSent();
  }, [state, onSent]);

  function choose(p: Patient | null) {
    setPatientId(p?.id ?? "");
    setPatient(p ? { name: p.name, phone: p.phone, age: p.age } : { name: "", phone: "", age: "" });
  }

  function toggle(id: string) {
    setPicks((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  function bump(id: string, by: number) {
    setPicks((current) => ({ ...current, [id]: Math.min(Math.max((current[id] ?? 1) + by, 1), 99) }));
  }

  const everything = [...prices.consultation, ...prices.radiology, ...prices.procedure];
  const priceOf = (id: string) => everything.find((i) => i.id === id)?.price ?? 0;
  const total =
    (consultation ? priceOf(consultation) : 0) +
    Object.entries(picks).reduce((sum, [id, qty]) => sum + priceOf(id) * qty, 0);
  const nothingChosen = (!consultation || consultation === "none") && Object.keys(picks).length === 0;

  return (
    <form action={action}>
      <input type="hidden" name="appointmentId" value={patientId} />
      <input type="hidden" name="consultation" value={consultation && consultation !== "none" ? consultation : ""} />
      {Object.entries(picks).map(([id, qty]) => (
        <span key={id}>
          <input type="hidden" name="pick" value={id} />
          <input type="hidden" name={`qty_${id}`} value={qty} />
        </span>
      ))}

      {/* ── patient ── */}
      <section style={{ marginBottom: 36 }}>
        <h2 className="sec-h" style={{ marginBottom: 14 }}>
          1 · Patient
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {appointments.map((a) => (
            <button key={a.id} type="button" onClick={() => choose(a)} style={chip(patientId === a.id)}>
              <span style={{ ...priceInk, minWidth: 64 }}>{a.time}</span>
              <span>{a.name}</span>
              {sentFor.has(a.id) && <span className="tag tag-accent" style={{ fontSize: 10 }}>sent</span>}
            </button>
          ))}
          <button type="button" onClick={() => choose(null)} style={chip(patientId === "")}>
            Walk-in / other patient
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 0.7fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="cv-name">Name</label>
            <input
              className="input"
              id="cv-name"
              name="name"
              required
              value={patient.name}
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              readOnly={patientId !== ""}
            />
          </div>
          <div className="field">
            <label htmlFor="cv-phone">Phone</label>
            <input
              className="input"
              id="cv-phone"
              name="phone"
              inputMode="tel"
              value={patient.phone}
              onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
              readOnly={patientId !== ""}
            />
          </div>
          <div className="field">
            <label htmlFor="cv-age">Age</label>
            <input
              className="input"
              id="cv-age"
              name="age"
              value={patient.age}
              onChange={(e) => setPatient({ ...patient, age: e.target.value })}
              readOnly={patientId !== ""}
            />
          </div>
        </div>
      </section>

      {/* ── consultation: exactly one, or none ── */}
      <section style={{ marginBottom: 36 }}>
        <h2 className="sec-h" style={{ marginBottom: 14 }}>
          2 · {CATEGORY_LABEL.consultation}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {prices.consultation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setConsultation(item.id)}
              style={chip(consultation === item.id)}
              aria-pressed={consultation === item.id}
            >
              {item.name} <span style={priceInk}>{rupees(item.price)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setConsultation("none")}
            style={chip(consultation === "none")}
            aria-pressed={consultation === "none"}
          >
            No consultation fee
          </button>
        </div>
      </section>

      {/* ── radiology & procedures: any number, with quantity ── */}
      {(["radiology", "procedure"] as const).map((category, i) => (
        <section key={category} style={{ marginBottom: 36 }}>
          <h2 className="sec-h" style={{ marginBottom: 14 }}>
            {i + 3} · {CATEGORY_LABEL[category]}
          </h2>
          {prices[category].length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--color-neutral-600)", margin: 0 }}>
              None on the price list yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {prices[category].map((item) => {
                const qty = picks[item.id];
                return (
                  <span key={item.id} style={{ ...chip(!!qty), padding: 0, gap: 0 }}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-pressed={!!qty}
                      style={{ ...chip(false), border: "none", background: "transparent" }}
                    >
                      {qty ? "✓ " : ""}
                      {item.name} <span style={priceInk}>{rupees(item.price)}</span>
                    </button>
                    {qty && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, paddingRight: 8 }}>
                        <Step label="−" onClick={() => bump(item.id, -1)} />
                        <span style={{ minWidth: 20, textAlign: "center", fontSize: 14 }}>×{qty}</span>
                        <Step label="+" onClick={() => bump(item.id, 1)} />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </section>
      ))}

      <section style={{ marginBottom: 28 }}>
        <div className="field">
          <label htmlFor="cv-note">Note for reception (optional)</label>
          <textarea
            className="input"
            id="cv-note"
            name="note"
            placeholder="e.g. Review after 2 weeks · physio referral · waive consultation"
            style={{ minHeight: 70 }}
          />
        </div>
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          padding: "18px 0",
          borderTop: "1px solid var(--color-divider)",
        }}
      >
        <button
          className="btn btn-primary"
          type="submit"
          disabled={pending || !consultation || nothingChosen || !patient.name.trim()}
          style={{ fontSize: 13, padding: "14px 28px" }}
        >
          {pending ? "Sending…" : "Send to reception"}
        </button>
        <span style={{ fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
          Bill total <strong>{rupees(total)}</strong>
        </span>
        {!consultation && (
          <span style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
            Choose a consultation type (or “No consultation fee”).
          </span>
        )}
        {state.message && !state.ok && (
          <span style={{ fontSize: 13, color: "var(--color-accent-2-700)" }}>{state.message}</span>
        )}
      </div>
    </form>
  );
}

function Step({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label === "+" ? "One more" : "One fewer"}
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        border: "1px solid var(--color-divider)",
        background: "var(--color-bg)",
        cursor: "pointer",
        font: "inherit",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

function SentToday({ visits }: { visits: Visit[] }) {
  const shown = [...visits].reverse();
  return (
    <aside>
      <h2 className="sec-h" style={{ marginBottom: 14 }}>
        Sent today
      </h2>
      {shown.length === 0 ? (
        <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>Nothing sent yet today.</p>
      ) : (
        <div style={{ borderTop: "1px solid var(--color-divider)" }}>
          {shown.map((v) => (
            <div key={v.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 16, textDecoration: v.status === "VOID" ? "line-through" : undefined }}>
                  {v.patientName}
                </span>
                <VisitStatusTag status={v.status} />
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-neutral-600)" }}>
                {v.items.map((l) => (l.qty > 1 ? `${l.name} ×${l.qty}` : l.name)).join(" · ")}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{rupees(totalDue(v))}</span>
                {v.status === "AT_RECEPTION" && (
                  <form action={voidVisitAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <button
                      className="btn btn-ghost"
                      type="submit"
                      style={{ fontSize: 13, color: "var(--color-accent-2-700)" }}
                    >
                      Withdraw
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
