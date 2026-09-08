"use client";

import { useState } from "react";
import { patientBring, patientExpect, patientFaqs } from "@/lib/content";

export default function PatientsPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="pad" style={{ padding: "56px 48px 90px" }}>
      <p className="eyebrow" style={{ margin: "0 0 16px" }}>
        Patient information
      </p>
      <h1
        style={{
          fontSize: "clamp(38px,5.4vw,74px)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          margin: "0 0 56px",
          maxWidth: "16ch",
        }}
      >
        Your first visit.
      </h1>

      <div
        className="two"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          maxWidth: 1400,
          marginBottom: 64,
        }}
      >
        <section>
          <h2 className="sec-h">What to bring</h2>
          <ul className="dotlist">
            {patientBring.map((item) => (
              <li key={item} style={{ padding: "14px 0 14px 22px", fontSize: 18 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="sec-h">What to expect</h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {patientExpect.map((item, i) => (
              <li
                key={item}
                style={{
                  padding: "16px 0 16px 46px",
                  position: "relative",
                  fontSize: 18,
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 16,
                    fontSize: 13,
                    color: "var(--color-accent-700)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section id="faqs" style={{ maxWidth: 900, scrollMarginTop: 150 }}>
        <h2
          style={{
            fontSize: "clamp(26px,3vw,38px)",
            letterSpacing: "-0.025em",
            margin: "0 0 24px",
          }}
        >
          Frequently asked questions
        </h2>
        {patientFaqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.q} style={{ borderBottom: "1px solid var(--color-divider)" }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 20,
                  textAlign: "left",
                  background: "transparent",
                  border: 0,
                  padding: "20px 0",
                  cursor: "pointer",
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "inherit",
                  letterSpacing: "-0.015em",
                }}
              >
                <span>{faq.q}</span>
                <span style={{ fontSize: 24, color: "var(--color-accent)", flex: "none" }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "var(--color-neutral-800)",
                    margin: "0 0 22px",
                    maxWidth: "62ch",
                    animation: "om-rise 0.3s ease both",
                  }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
        <p
          style={{
            fontSize: 14,
            color: "var(--color-neutral-600)",
            marginTop: 26,
            maxWidth: "62ch",
          }}
        >
          These answers are general. They are not a diagnosis and cannot account for your particular
          history. Anything in brackets is awaiting confirmation from the clinic.
        </p>
      </section>
    </main>
  );
}
