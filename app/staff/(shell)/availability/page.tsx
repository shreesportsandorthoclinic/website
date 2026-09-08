import type { Metadata } from "next";
import { availabilityRows, currentBlocks } from "@/lib/practice";

export const metadata: Metadata = { title: "Practice — availability" };

export default function AvailabilityPage() {
  return (
    <main style={{ padding: "36px 32px 80px", maxWidth: 1200 }}>
      <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Availability</h1>
      <p
        style={{
          fontSize: 16,
          color: "var(--color-neutral-700)",
          margin: "0 0 36px",
          maxWidth: "56ch",
        }}
      >
        Clinic hours drive which slots patients can request. Changes here take effect immediately on
        the booking page.
      </p>

      <section style={{ marginBottom: 44 }}>
        <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
          Weekly clinic hours
        </h2>
        <table className="table" style={{ fontSize: 16 }}>
          <thead>
            <tr>
              <th>Day</th>
              <th>Morning</th>
              <th>Evening</th>
              <th>Pattern</th>
              <th style={{ textAlign: "right" }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {availabilityRows.map((row) => (
              <tr key={row.day}>
                <td>{row.day}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.morning}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.evening}</td>
                <td>
                  <span className="tag tag-neutral" style={{ fontSize: 11 }}>
                    {row.note}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" type="button" style={{ fontSize: 13 }}>
                    Change
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <section>
          <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
            Block time
          </h2>
          <form style={{ display: "grid", gap: 16, maxWidth: 420 }}>
            <div className="field">
              <label htmlFor="bl-date" style={{ fontSize: 13 }}>
                Date
              </label>
              <input
                className="input"
                id="bl-date"
                placeholder="8 September 2026"
                style={{ minHeight: 44, borderRadius: 20 }}
              />
            </div>
            <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field">
                <label htmlFor="bl-from" style={{ fontSize: 13 }}>
                  From
                </label>
                <input
                  className="input"
                  id="bl-from"
                  placeholder="19:00"
                  style={{ minHeight: 44, borderRadius: 20 }}
                />
              </div>
              <div className="field">
                <label htmlFor="bl-to" style={{ fontSize: 13 }}>
                  To
                </label>
                <input
                  className="input"
                  id="bl-to"
                  placeholder="21:00"
                  style={{ minHeight: 44, borderRadius: 20 }}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="bl-why" style={{ fontSize: 13 }}>
                Reason (internal)
              </label>
              <input
                className="input"
                id="bl-why"
                placeholder="Surgery list / travel / personal"
                style={{ minHeight: 44, borderRadius: 20 }}
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ fontSize: 12, padding: "14px 24px" }}>
              Block this time
            </button>
          </form>
        </section>

        <section>
          <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
            Current blocks &amp; leave
          </h2>
          <div style={{ borderTop: "1px solid var(--color-divider)" }}>
            {currentBlocks.map((block) => (
              <div
                key={block.date}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <span>
                  <span style={{ fontSize: 17 }}>{block.date}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--color-neutral-600)" }}>
                    {block.detail}
                  </span>
                </span>
                <button className="btn btn-ghost" type="button" style={{ fontSize: 13 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            style={{ marginTop: 20, fontSize: 12, padding: "13px 22px" }}
          >
            Add leave
          </button>
        </section>
      </div>
    </main>
  );
}
