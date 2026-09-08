import Link from "next/link";
import { notFound } from "next/navigation";
import StatusButton from "@/components/StatusButton";
import StatusTag from "@/components/StatusTag";
import { shortDate } from "@/lib/schedule";
import { getAppointment } from "@/lib/store";
import { saveNotesAction } from "../../../actions";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function AppointmentPage({ params }: Params) {
  const { id } = await params;
  const appt = await getAppointment(id);
  if (!appt) notFound();

  const facts = [
    { term: "Phone", value: appt.phone },
    { term: "Email", value: appt.email },
    { term: "Age", value: appt.age },
    { term: "Previous visits", value: appt.history },
    { term: "Reference", value: appt.reference },
  ];

  return (
    <main style={{ padding: "36px 32px 80px", maxWidth: 1200 }}>
      <Link className="btn btn-ghost" href="/staff" style={{ fontSize: 14, marginBottom: 20 }}>
        ← All appointments
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 40, letterSpacing: "-0.03em", margin: "0 0 8px" }}>{appt.name}</h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--color-neutral-700)" }}>
            {shortDate(appt.date)} · {appt.time} · {appt.type}
          </p>
        </div>
        <StatusTag status={appt.status} fontSize={12} padding="8px 14px" />
      </div>

      <div
        className="two"
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "start" }}
      >
        <div>
          <section style={{ marginBottom: 36 }}>
            <h2 className="sec-h" style={{ marginBottom: 14 }}>
              Patient
            </h2>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 18,
                margin: 0,
              }}
            >
              {facts.map((fact) => (
                <div key={fact.term}>
                  <dt
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-neutral-700)",
                      marginBottom: 5,
                    }}
                  >
                    {fact.term}
                  </dt>
                  <dd style={{ margin: 0, fontSize: 17 }}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 className="sec-h" style={{ marginBottom: 14 }}>
              Reason for visit
            </h2>
            <p style={{ fontSize: 19, lineHeight: 1.6, margin: 0, maxWidth: "56ch" }}>{appt.reason}</p>
          </section>

          <section>
            <h2 className="sec-h" style={{ marginBottom: 14 }}>
              Clinical notes
            </h2>
            <form action={saveNotesAction} style={{ display: "grid", gap: 12, justifyItems: "start" }}>
              <input type="hidden" name="id" value={appt.id} />
              <label htmlFor="notes" style={{ position: "absolute", left: -9999 }}>
                Clinical notes
              </label>
              <textarea
                className="input"
                id="notes"
                name="notes"
                defaultValue={appt.notes ?? ""}
                placeholder="Notes are saved against this appointment. [ A full clinical records module still needs to be specified with the clinic. ]"
                style={{ minHeight: 140, fontSize: 16, borderRadius: 20 }}
              />
              <button className="btn btn-secondary" type="submit" style={{ fontSize: 12, padding: "12px 22px" }}>
                Save notes
              </button>
            </form>
          </section>
        </div>

        <aside
          style={{
            display: "grid",
            gap: 10,
            borderTop: "1px solid var(--color-divider)",
            paddingTop: 20,
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              margin: "0 0 4px",
            }}
          >
            Actions
          </p>
          <StatusButton
            id={appt.id}
            status="CONFIRMED"
            label="Confirm appointment"
            className="btn btn-primary"
            style={{ fontSize: 12, padding: "14px 24px" }}
          />
          <StatusButton
            id={appt.id}
            status="RESCHEDULED"
            label="Reschedule"
            style={{ fontSize: 12, padding: "14px 24px" }}
          />
          <StatusButton
            id={appt.id}
            status="COMPLETED"
            label="Mark completed"
            style={{ fontSize: 12, padding: "14px 24px" }}
          />
          <StatusButton
            id={appt.id}
            status="NO-SHOW"
            label="Mark no-show"
            style={{ fontSize: 12, padding: "14px 24px" }}
          />
          <StatusButton
            id={appt.id}
            status="CANCELLED"
            label="Cancel appointment"
            style={{
              fontSize: 12,
              padding: "14px 24px",
              borderColor: "var(--color-accent-2-400)",
              color: "var(--color-accent-2-700)",
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "var(--color-neutral-700)",
              margin: "10px 0 0",
              lineHeight: 1.5,
            }}
          >
            Cancelling or marking a no-show releases the slot for rebooking.{" "}
            <span style={{ color: "var(--color-accent-2-700)" }}>
              [ Notification delivery not yet integrated — the patient is not told. ]
            </span>
          </p>
        </aside>
      </div>
    </main>
  );
}
