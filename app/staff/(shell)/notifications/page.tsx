import type { Metadata } from "next";
import { notifications, plannedFeatures } from "@/lib/practice";

export const metadata: Metadata = { title: "Practice — patient notifications" };

export default function NotificationsPage() {
  return (
    <main style={{ padding: "36px 32px 80px", maxWidth: 1100 }}>
      <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        Patient notifications
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "var(--color-neutral-700)",
          margin: "0 0 12px",
          maxWidth: "60ch",
        }}
      >
        The messages the system sends and when. Wording is editable by the clinic.
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--color-neutral-700)",
          margin: "0 0 36px",
          maxWidth: "60ch",
        }}
      >
        Email (to the patient) is live once RESEND_API_KEY/NOTIFY_FROM_EMAIL are set. A new
        booking also alerts the clinic on every channel that's configured — Telegram
        (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID) and a copy to the clinic's own inbox. SMS and
        WhatsApp are not implemented yet.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 20,
        }}
      >
        {notifications.map((n) => (
          <div
            key={n.when}
            style={{ border: "1px solid var(--color-divider)", borderRadius: 20, padding: 22 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-accent-700)",
                }}
              >
                {n.when}
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-neutral-600)",
                }}
              >
                {n.channels}
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 19,
                margin: "0 0 10px",
                letterSpacing: "-0.015em",
              }}
            >
              {n.title}
            </p>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.55,
                color: "var(--color-neutral-800)",
                margin: 0,
                padding: 14,
                background: "var(--color-neutral-100)",
                borderRadius: 20,
              }}
            >
              {n.body}
            </p>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 52 }}>
        <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
          Planned for later releases
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {plannedFeatures.map((feature) => (
            <span
              key={feature}
              className="tag tag-outline"
              style={{
                fontSize: 13,
                padding: "7px 13px",
                borderColor: "var(--color-accent-2-400)",
                color: "var(--color-accent-2-700)",
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
