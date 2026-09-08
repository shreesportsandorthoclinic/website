"use client";

import Link from "next/link";
import { useState } from "react";
import { clinic, photos } from "@/lib/content";
import {
  appointmentTypes,
  bookingSteps,
  bookingWindow,
  isoForOffset,
  longLabelForOffset,
  MAX_ADVANCE_DAYS,
  type Slot,
} from "@/lib/schedule";

type Status = "idle" | "loading" | "confirmed" | "error" | "cancelled" | "rescheduled";

const emptyForm = { name: "", phone: "", email: "", age: "", reason: "", company: "" };
const CONSENT_COPY =
  "I agree to the clinic contacting me about this appointment and to my details being processed as described in the Privacy Policy.";

const roundInput = { minHeight: 48, fontSize: 16, borderRadius: 20 } as const;

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  /* The bookable days: tomorrow through ten days out. Computed once so the
     list is stable for the life of the page. `day` above is the offset into
     this window (1–10), not a calendar date. */
  const [window] = useState(bookingWindow);

  /* Contact-detail verification. The clinic only receives a request once the
     visitor proves they control the email address. */
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpNote, setOtpNote] = useState("");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneOk = form.phone.replace(/[^\d]/g, "").length >= 7;

  function resetVerification() {
    setOtpId(null);
    setOtpCode("");
    setOtpSent(false);
    setOtpError("");
    setOtpNote("");
    setVerifiedToken(null);
  }

  async function sendCode() {
    setOtpBusy(true);
    setOtpError("");
    setOtpNote("");
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, phone: form.phone, company: form.company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "Could not send a code.");
        return;
      }
      setOtpId(data.id);
      setOtpSent(true);
      setVerifiedToken(null);
      setOtpNote(
        data.devCode
          ? `Email delivery is not configured yet — your code is ${data.devCode}.`
          : `We've emailed a 6-digit code to ${form.email}. It expires in 10 minutes.`,
      );
    } catch {
      setOtpError("Could not reach the server. Try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtpCode() {
    if (!otpId) return;
    setOtpBusy(true);
    setOtpError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: otpId, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "That code is not correct.");
        return;
      }
      setVerifiedToken(data.token);
      setOtpNote("");
    } catch {
      setOtpError("Could not reach the server. Try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  /* Availability comes from the server so the grid reflects what is actually
     booked, including anything taken since the page loaded. Fetched on the
     interactions that need it rather than from an effect. */
  async function loadSlots(forDay: number) {
    setLoadingSlots(true);
    setSlotsError(false);
    try {
      const response = await fetch(`/api/availability?day=${forDay}`);
      if (!response.ok) throw new Error("bad status");
      const data = await response.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
      setSlotsError(true);
    } finally {
      setLoadingSlots(false);
    }
  }

  function pickDay(forDay: number) {
    setDay(forDay);
    setSlot(null);
    setSlots([]);
    void loadSlots(forDay);
  }

  const typeLabel = appointmentTypes.find((t) => t.key === type)?.name ?? "—";
  const dayLabel = day != null ? longLabelForOffset(day) : "—";
  const slotLabel = slot ?? "—";

  const setField = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (!consent) {
      setError("Please agree to the privacy notice before requesting an appointment.");
      setStatus("error");
      return;
    }
    if (!verifiedToken) {
      setError("Verify your email address before requesting an appointment.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, day, slot, ...form, verificationToken: verifiedToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "The request did not reach the clinic.");
        setStatus("error");
        /* A 409 means someone else took the slot — refresh the grid so a
           retry shows the truth. */
        if (response.status === 409 && day !== null) {
          setSlot(null);
          await loadSlots(day);
        }
        return;
      }
      setReference(data.reference);
      setStatus("confirmed");
    } catch {
      setError("The request did not reach the clinic.");
      setStatus("error");
    }
  }

  function restart() {
    setStep(1);
    setType(null);
    setDay(null);
    setSlot(null);
    setSlots([]);
    setForm(emptyForm);
    setConsent(false);
    setStatus("idle");
    resetVerification();
  }

  return (
    <main className="pad" style={{ padding: "48px 48px 90px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {status === "idle" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginBottom: 52,
            }}
          >
            {bookingSteps.map((label, i) => {
              const n = i + 1;
              const color =
                step === n
                  ? "var(--color-text)"
                  : step > n
                    ? "var(--color-accent-700)"
                    : "var(--color-neutral-500)";
              const canGoBack = n < step;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={!canGoBack}
                  onClick={() => canGoBack && setStep(n)}
                  style={{
                    textAlign: "left",
                    background: "transparent",
                    border: 0,
                    font: "inherit",
                    padding: 0,
                    paddingTop: 12,
                    borderTop: `3px solid ${step >= n ? "var(--color-text)" : "var(--color-divider)"}`,
                    borderRadius: 2,
                    cursor: canGoBack ? "pointer" : "default",
                  }}
                >
                  <span
                    style={{ display: "block", fontSize: 11, letterSpacing: "0.14em", color, marginBottom: 4 }}
                  >
                    0{n}
                  </span>
                  <span style={{ display: "block", fontSize: 14, letterSpacing: "-0.01em", color }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* step 1 — appointment type */}
        {status === "idle" && step === 1 && (
          <>
            <h1
              style={{
                fontSize: "clamp(34px,4.6vw,58px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: "0 0 12px",
              }}
            >
              What kind of appointment?
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "var(--color-neutral-700)",
                margin: "0 0 36px",
                maxWidth: "52ch",
              }}
            >
              If you are not sure, choose new consultation. It can be changed when the clinic
              confirms.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {appointmentTypes.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setType(t.key);
                    setStep(2);
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 20,
                    textAlign: "left",
                    width: "100%",
                    padding: "22px 24px",
                    background: type === t.key ? "var(--color-accent-100)" : "transparent",
                    border: `1px solid ${type === t.key ? "var(--color-accent)" : "var(--color-divider)"}`,
                    borderRadius: 20,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    color: "inherit",
                  }}
                >
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 600,
                        fontSize: 21,
                        letterSpacing: "-0.015em",
                        marginBottom: 4,
                      }}
                    >
                      {t.name}
                    </span>
                    <span style={{ display: "block", fontSize: 15, color: "var(--color-neutral-700)" }}>
                      {t.note}
                    </span>
                  </span>
                  <span style={{ color: "var(--color-accent)", fontSize: 20 }}>→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* step 2 — doctor */}
        {status === "idle" && step === 2 && (
          <>
            <h1
              style={{
                fontSize: "clamp(34px,4.6vw,58px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: "0 0 12px",
              }}
            >
              Who would you like to see?
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "var(--color-neutral-700)",
                margin: "0 0 36px",
                maxWidth: "52ch",
              }}
            >
              One consulting doctor at present. Additional practitioners can be added to this list
              by the clinic.
            </p>
            <button
              type="button"
              onClick={() => setStep(3)}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "center",
                textAlign: "left",
                width: "100%",
                padding: 24,
                background: "transparent",
                border: "1px solid var(--color-divider)",
                borderRadius: 20,
                cursor: "pointer",
                color: "inherit",
                fontFamily: "var(--font-body)",
              }}
            >
              <img
                src={photos.doctor.src}
                alt={photos.doctor.alt}
                style={{
                  width: 84,
                  height: 84,
                  flex: "none",
                  objectFit: "cover",
                  borderRadius: 999,
                  background: "var(--color-neutral-100)",
                }}
              />
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: 24,
                    letterSpacing: "-0.015em",
                    marginBottom: 4,
                  }}
                >
                  {clinic.doctor.name}
                </span>
                <span style={{ display: "block", fontSize: 15, color: "var(--color-neutral-700)" }}>
                  {clinic.doctor.fullName} · {clinic.doctor.title}
                </span>
              </span>
              <span style={{ color: "var(--color-accent)", fontSize: 20 }}>→</span>
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setStep(1)}
              style={{ marginTop: 28, fontSize: 14 }}
            >
              ← Back
            </button>
          </>
        )}

        {/* step 3 — date & time */}
        {status === "idle" && step === 3 && (
          <>
            <h1
              style={{
                fontSize: "clamp(34px,4.6vw,58px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: "0 0 12px",
              }}
            >
              Choose a date and time.
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "var(--color-neutral-700)",
                margin: "0 0 36px",
                maxWidth: "52ch",
              }}
            >
              Only slots currently open in the clinic&rsquo;s schedule are shown. Requests are
              confirmed by the clinic before the appointment is final.
            </p>
            <div
              className="two"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: 18,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20 }}>
                    Choose a day
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-neutral-600)",
                    }}
                  >
                    Next {MAX_ADVANCE_DAYS} days
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
                    gap: 8,
                  }}
                >
                  {window.map((d) => {
                    const selected = day === d.offset;
                    return (
                      <button
                        key={d.offset}
                        type="button"
                        disabled={d.closed}
                        onClick={() => pickDay(d.offset)}
                        style={{
                          minHeight: 58,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          padding: "8px 6px",
                          background: selected ? "var(--color-accent)" : "transparent",
                          color: selected
                            ? "var(--color-bg)"
                            : d.closed
                              ? "var(--color-neutral-400)"
                              : "var(--color-text)",
                          border: `1px solid ${
                            selected
                              ? "var(--color-accent)"
                              : d.closed
                                ? "transparent"
                                : "var(--color-divider)"
                          }`,
                          borderRadius: 16,
                          cursor: d.closed ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-heading)",
                          fontSize: 15,
                          textDecoration: d.closed ? "line-through" : "none",
                        }}
                      >
                        {d.label}
                        {d.closed && (
                          <span
                            style={{
                              fontSize: 9,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}
                          >
                            Closed
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p style={{ marginTop: 16, fontSize: 12, color: "var(--color-neutral-700)" }}>
                  Appointments can be requested from tomorrow up to {MAX_ADVANCE_DAYS} days ahead.
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: 18,
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20 }}>
                    Available times
                  </span>
                  <span style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{dayLabel}</span>
                </div>

                {day && loadingSlots && (
                  <p style={{ fontSize: 15, color: "var(--color-neutral-600)" }}>
                    Checking the clinic&rsquo;s schedule…
                  </p>
                )}

                {day && !loadingSlots && slotsError && (
                  <p style={{ fontSize: 15, color: "var(--color-accent-2-700)" }}>
                    We couldn&rsquo;t load available times just now. Please try again in a moment, or
                    call the clinic on{" "}
                    <a href={`tel:${clinic.phone}`} style={{ color: "var(--color-accent-700)" }}>
                      {clinic.phone}
                    </a>
                    .
                  </p>
                )}

                {day && !loadingSlots && !slotsError && slots.length === 0 && (
                  <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>
                    Nothing open on this date. Choose another day.
                  </p>
                )}

                {day && !loadingSlots && slots.length > 0 && (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(104px,1fr))",
                        gap: 8,
                      }}
                    >
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          type="button"
                          disabled={s.taken}
                          onClick={() => setSlot(s.time)}
                          style={{
                            minHeight: 48,
                            padding: "12px 8px",
                            background: s.taken
                              ? "var(--color-neutral-200)"
                              : slot === s.time
                                ? "var(--color-accent)"
                                : "transparent",
                            color: s.taken
                              ? "var(--color-neutral-500)"
                              : slot === s.time
                                ? "var(--color-bg)"
                                : "var(--color-text)",
                            border: `1px solid ${
                              s.taken
                                ? "var(--color-neutral-200)"
                                : slot === s.time
                                  ? "var(--color-accent)"
                                  : "var(--color-divider)"
                            }`,
                            borderRadius: 20,
                            cursor: s.taken ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-heading)",
                            fontSize: 15,
                            textDecoration: s.taken ? "line-through" : "none",
                          }}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-neutral-600)", marginTop: 16 }}>
                      Each appointment is 15 minutes. Struck-through times are already booked.
                    </p>
                  </>
                )}

                {slot && (
                  <button
                    className="btn btn-primary btn-block"
                    type="button"
                    onClick={() => setStep(4)}
                    style={{ marginTop: 24, fontSize: 12, padding: "16px 28px" }}
                  >
                    Continue to your details
                  </button>
                )}
              </div>
            </div>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setStep(2)}
              style={{ marginTop: 28, fontSize: 14 }}
            >
              ← Back
            </button>
          </>
        )}

        {/* step 4 — details */}
        {status === "idle" && step === 4 && (
          <>
            <h1
              style={{
                fontSize: "clamp(34px,4.6vw,58px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: "0 0 12px",
              }}
            >
              Your details.
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "var(--color-neutral-700)",
                margin: "0 0 36px",
                maxWidth: "52ch",
              }}
            >
              Used only to confirm and prepare for your appointment.
            </p>
            <div
              className="two"
              style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 48, alignItems: "start" }}
            >
              <form
                style={{ display: "grid", gap: 20 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
              >
                <div className="field">
                  <label htmlFor="bk-name" style={{ fontSize: 13 }}>
                    Full name
                  </label>
                  <input
                    className="input"
                    id="bk-name"
                    required
                    value={form.name}
                    onChange={(e) => setField("name")(e.target.value)}
                    placeholder="As it should appear on clinic records"
                    style={roundInput}
                  />
                </div>
                <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div className="field">
                    <label htmlFor="bk-phone" style={{ fontSize: 13 }}>
                      Phone
                    </label>
                    <input
                      className="input"
                      id="bk-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => {
                        setField("phone")(e.target.value);
                        if (verifiedToken || otpSent) resetVerification();
                      }}
                      placeholder="+91"
                      style={roundInput}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="bk-age" style={{ fontSize: 13 }}>
                      Age
                    </label>
                    <input
                      className="input"
                      id="bk-age"
                      inputMode="numeric"
                      value={form.age}
                      onChange={(e) => setField("age")(e.target.value)}
                      placeholder="Years"
                      style={roundInput}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="bk-email" style={{ fontSize: 13 }}>
                    Email
                  </label>
                  <input
                    className="input"
                    id="bk-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => {
                      setField("email")(e.target.value);
                      if (verifiedToken || otpSent) resetVerification();
                    }}
                    placeholder="We'll send a verification code here"
                    style={roundInput}
                  />
                </div>

                {/* honeypot — hidden from real users */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.company}
                  onChange={(e) => setField("company")(e.target.value)}
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />

                <div
                  style={{
                    border: `1px solid ${verifiedToken ? "var(--color-accent)" : "var(--color-divider)"}`,
                    borderRadius: 20,
                    padding: 20,
                    background: verifiedToken ? "var(--color-accent-100)" : "transparent",
                  }}
                >
                  {verifiedToken ? (
                    <p style={{ margin: 0, fontSize: 15, color: "var(--color-accent-800)" }}>
                      ✓ Email verified. You can request the appointment.
                    </p>
                  ) : (
                    <>
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: 14,
                          color: "var(--color-neutral-800)",
                        }}
                      >
                        Verify your email so the clinic knows the request is genuine. Both a phone
                        number and an email are required.
                      </p>
                      {!otpSent ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={!emailOk || !phoneOk || otpBusy}
                          onClick={() => void sendCode()}
                          style={{ fontSize: 12, padding: "12px 22px" }}
                        >
                          {otpBusy ? "Sending…" : "Send verification code"}
                        </button>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                          <input
                            className="input"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ""))}
                            placeholder="6-digit code"
                            style={{ ...roundInput, maxWidth: 160, letterSpacing: "0.3em" }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={otpCode.length < 6 || otpBusy}
                            onClick={() => void verifyOtpCode()}
                            style={{ fontSize: 12, padding: "12px 22px" }}
                          >
                            {otpBusy ? "Checking…" : "Verify"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            disabled={otpBusy}
                            onClick={() => void sendCode()}
                            style={{ fontSize: 13 }}
                          >
                            Resend
                          </button>
                        </div>
                      )}
                      {otpNote && (
                        <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-neutral-700)" }}>
                          {otpNote}
                        </p>
                      )}
                      {otpError && (
                        <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--color-accent-2-700)" }}>
                          {otpError}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="bk-reason" style={{ fontSize: 13 }}>
                    Reason for visit
                  </label>
                  <textarea
                    className="input"
                    id="bk-reason"
                    value={form.reason}
                    onChange={(e) => setField("reason")(e.target.value)}
                    placeholder="What is bothering you, when it started, and what makes it worse"
                    style={{ ...roundInput, minHeight: 120 }}
                  />
                  <p style={{ fontSize: 12, color: "var(--color-neutral-600)", margin: "6px 0 0" }}>
                    A sentence is enough. This is not a diagnosis form.
                  </p>
                </div>
                <label
                  className="radio"
                  htmlFor="bk-consent"
                  style={{ alignItems: "flex-start", fontSize: 13, gap: 10 }}
                >
                  <input
                    id="bk-consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span className="dot" style={{ borderRadius: 6, marginTop: 2 }} />
                  <span style={{ color: "var(--color-neutral-800)", lineHeight: 1.5 }}>
                    {CONSENT_COPY}{" "}
                    <Link href="/privacy" style={{ color: "var(--color-accent-700)" }}>
                      Read the Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={!consent || !verifiedToken}
                  style={{ fontSize: 12, padding: "17px 28px", marginTop: 4 }}
                >
                  Request this appointment
                </button>
                {!verifiedToken && (
                  <p style={{ fontSize: 12, color: "var(--color-neutral-600)", margin: 0 }}>
                    Verify your email above to enable this button.
                  </p>
                )}
              </form>

              <div
                className="sticky-aside"
                style={{
                  borderTop: "1px solid var(--color-divider)",
                  paddingTop: 20,
                  position: "sticky",
                  top: 150,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--color-neutral-700)",
                    margin: "0 0 14px",
                  }}
                >
                  Your appointment
                </p>
                <dl style={{ margin: 0 }}>
                  {[
                    ["Type", typeLabel],
                    ["Doctor", clinic.doctor.name],
                    ["Date", dayLabel],
                    ["Time", slotLabel],
                  ].map(([term, value]) => (
                    <div
                      key={term}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "11px 0",
                        borderBottom: "1px solid var(--color-divider)",
                      }}
                    >
                      <dt style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{term}</dt>
                      <dd style={{ margin: 0, fontSize: 16, textAlign: "right" }}>{value}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ marginTop: 16, fontSize: 14 }}
                >
                  ← Change date or time
                </button>
              </div>
            </div>
          </>
        )}

        {/* loading */}
        {status === "loading" && (
          <div
            style={{
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
              textAlign: "center",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                border: "2px solid var(--color-divider)",
                borderTopColor: "var(--color-accent)",
                borderRadius: "50%",
                animation: "om-spin 0.8s linear infinite",
                display: "block",
              }}
            />
            <p style={{ fontSize: 22, margin: 0, letterSpacing: "-0.015em" }}>
              Sending your request to the clinic…
            </p>
            <p style={{ fontSize: 15, color: "var(--color-neutral-700)", margin: 0 }}>
              Do not close this page.
            </p>
          </div>
        )}

        {/* error */}
        {status === "error" && (
          <div
            style={{
              maxWidth: 560,
              padding: 36,
              border: "1px solid var(--color-accent-2-500)",
              borderRadius: 20,
              background: "var(--color-accent-2-100)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-accent-2-700)",
                margin: "0 0 12px",
              }}
            >
              Could not complete booking
            </p>
            <h1 style={{ fontSize: 34, letterSpacing: "-0.025em", margin: "0 0 14px", lineHeight: 1.05 }}>
              Your slot was not held.
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "var(--color-accent-2-800)",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              {error} Nothing has been booked and you have not been charged. Try again, or call the
              clinic directly.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => void submit()}
                style={{ fontSize: 12, padding: "14px 26px" }}
              >
                Try again
              </button>
              <a
                className="btn btn-secondary"
                href={`tel:${clinic.phone}`}
                style={{ fontSize: 12, padding: "14px 26px" }}
              >
                Call the clinic
              </a>
            </div>
          </div>
        )}

        {/* confirmed */}
        {status === "confirmed" && (
          <div
            className="two"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 48,
              alignItems: "start",
              animation: "om-rise 0.45s ease both",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                  margin: "0 0 16px",
                }}
              >
                Confirmed · Ref {reference}
              </p>
              <h1
                style={{
                  fontSize: "clamp(36px,4.8vw,62px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  margin: "0 0 20px",
                }}
              >
                Appointment confirmed.
              </h1>
              <p
                style={{
                  fontSize: 18,
                  color: "var(--color-neutral-800)",
                  margin: "0 0 32px",
                  maxWidth: "44ch",
                  lineHeight: 1.5,
                }}
              >
                A confirmation has been sent to the contact details you gave. Please arrive ten
                minutes early with any previous reports and imaging.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a
                  className="btn btn-primary"
                  href={calendarLink({ day, slot, typeLabel })}
                  download="appointment.ics"
                  style={{ fontSize: 12, padding: "14px 26px" }}
                >
                  Add to calendar
                </a>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setSlot(null);
                    setStep(3);
                    setStatus("idle");
                    if (day !== null) void loadSlots(day);
                  }}
                  style={{ fontSize: 12, padding: "14px 26px" }}
                >
                  Reschedule
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setStatus("cancelled")}
                  style={{
                    fontSize: 12,
                    padding: "14px 26px",
                    borderColor: "var(--color-accent-2-400)",
                    color: "var(--color-accent-2-700)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 20 }}>
              <dl style={{ margin: 0, display: "grid" }}>
                {[
                  ["Doctor", clinic.doctor.name],
                  ["Date", dayLabel],
                  ["Time", slotLabel],
                  ["Type", typeLabel],
                ].map(([term, value]) => (
                  <div key={term} className="dl-row" style={{ padding: "13px 0" }}>
                    <dt>{term}</dt>
                    <dd style={{ textAlign: "right" }}>{value}</dd>
                  </div>
                ))}
                <div className="dl-row" style={{ padding: "13px 0" }}>
                  <dt>Location</dt>
                  <dd style={{ fontSize: 16, textAlign: "right", lineHeight: 1.4 }}>
                    Neeladri Layout, Doddathoguru
                    <br />
                    Electronic City Phase-1, Bengaluru
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* cancelled */}
        {status === "cancelled" && (
          <div style={{ maxWidth: 620 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-neutral-600)",
                margin: "0 0 16px",
              }}
            >
              Cancelled · Ref {reference}
            </p>
            <h1
              style={{
                fontSize: "clamp(34px,4.4vw,54px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: "0 0 18px",
              }}
            >
              Appointment cancelled.
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "var(--color-neutral-800)",
                margin: "0 0 12px",
                lineHeight: 1.5,
              }}
            >
              Your {dayLabel} appointment at {slotLabel} has been released. The clinic has been
              notified.
            </p>
            <p style={{ fontSize: 15, color: "var(--color-neutral-700)", margin: "0 0 28px" }}>
              If this was a mistake, you can book the same slot again while it remains open.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={restart}
                style={{ fontSize: 12, padding: "14px 26px" }}
              >
                Book again
              </button>
              <Link className="btn btn-secondary" href="/" style={{ fontSize: 12, padding: "14px 26px" }}>
                Back to home
              </Link>
            </div>
          </div>
        )}

        {/* rescheduled */}
        {status === "rescheduled" && (
          <div style={{ maxWidth: 620 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-accent-700)",
                margin: "0 0 16px",
              }}
            >
              Rescheduled · Ref {reference}
            </p>
            <h1
              style={{
                fontSize: "clamp(34px,4.4vw,54px)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                margin: "0 0 18px",
              }}
            >
              Appointment moved.
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "var(--color-neutral-800)",
                margin: "0 0 28px",
                lineHeight: 1.5,
              }}
            >
              Your appointment is now {dayLabel} at {slotLabel} with {clinic.doctor.name}. The
              previous slot has been released.
            </p>
            <Link className="btn btn-secondary" href="/" style={{ fontSize: 12, padding: "14px 26px" }}>
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

/* A minimal .ics so "Add to calendar" is real rather than decorative. */
function calendarLink({
  day,
  slot,
  typeLabel,
}: {
  day: number | null;
  slot: string | null;
  typeLabel: string;
}) {
  if (day == null || !slot) return "#";
  const [clock, meridiem] = slot.split(" ");
  const [rawHour, minute] = clock.split(":").map(Number);
  let hour = rawHour % 12;
  if (meridiem === "PM") hour += 12;
  const startMinutes = hour * 60 + minute;
  const date = isoForOffset(day).replace(/-/g, "");
  const stamp = (totalMinutes: number) =>
    `${date}T${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}${String(totalMinutes % 60).padStart(2, "0")}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shree Sports and Ortho Clinic//Booking//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${typeLabel} — ${clinic.doctor.name}`,
    `DTSTART;TZID=Asia/Kolkata:${stamp(startMinutes)}`,
    `DTEND;TZID=Asia/Kolkata:${stamp(startMinutes + 15)}`,
    `LOCATION:${clinic.name}, ${clinic.addressLines.join(", ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
