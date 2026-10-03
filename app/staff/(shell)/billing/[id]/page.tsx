import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVisit } from "@/lib/billing";
import { billNumber, PAYMENT_LABEL, rupees, subtotal, totalDue } from "@/lib/billing-shared";
import { clinic } from "@/lib/content";
import { shortDate } from "@/lib/schedule";
import PrintButton from "./PrintButton";

export const metadata: Metadata = { title: "Practice — bill" };
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function BillPage({ params }: Params) {
  const { id } = await params;
  const visit = await getVisit(id);
  if (!visit) notFound();

  const paid = visit.status === "PAID";
  const facts = [
    { term: "Bill no.", value: paid ? billNumber(visit.billNo) : "Not yet paid" },
    { term: "Date", value: shortDate(visit.date) },
    { term: "Patient", value: visit.patientName },
    { term: "Age / phone", value: [visit.patientAge, visit.patientPhone].filter(Boolean).join(" · ") || "—" },
  ];

  return (
    <main style={{ padding: "36px 32px 80px" }}>
      <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <Link className="btn btn-ghost" href="/staff/billing" style={{ fontSize: 14 }}>
          ← Billing
        </Link>
        <PrintButton />
      </div>

      <article
        style={{
          maxWidth: 620,
          border: "1px solid var(--color-divider)",
          borderRadius: 16,
          padding: "32px 36px",
          background: "#ffffff",
          color: "#111111",
        }}
      >
        <header style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <img src="/images/logo.jpeg" alt="" style={{ height: 56, width: "auto" }} />
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20 }}>
              {clinic.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, lineHeight: 1.5 }}>
              {clinic.addressLines.join(", ")}
              <br />
              {clinic.phone} · {clinic.email}
            </p>
          </div>
        </header>

        <p
          style={{
            margin: "0 0 16px",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            borderTop: "1px solid #dddddd",
            paddingTop: 16,
          }}
        >
          {paid ? "Bill / receipt" : "Bill — awaiting payment"}
        </p>

        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", margin: "0 0 22px" }}>
          {facts.map((f) => (
            <div key={f.term}>
              <dt style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666666" }}>
                {f.term}
              </dt>
              <dd style={{ margin: "2px 0 0", fontSize: 15 }}>{f.value}</dd>
            </div>
          ))}
        </dl>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #111111" }}>
              <th style={{ textAlign: "left", padding: "6px 0" }}>Item</th>
              <th style={{ textAlign: "right", padding: "6px 0" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "6px 0" }}>Rate</th>
              <th style={{ textAlign: "right", padding: "6px 0" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {visit.items.map((line, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eeeeee" }}>
                <td style={{ padding: "8px 0" }}>{line.name}</td>
                <td style={{ textAlign: "right" }}>{line.qty}</td>
                <td style={{ textAlign: "right" }}>{rupees(line.price)}</td>
                <td style={{ textAlign: "right" }}>{rupees(line.price * line.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", padding: "10px 0 2px" }}>Subtotal</td>
              <td style={{ textAlign: "right", padding: "10px 0 2px" }}>{rupees(subtotal(visit.items))}</td>
            </tr>
            {visit.discount > 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "right", padding: "2px 0" }}>Discount</td>
                <td style={{ textAlign: "right", padding: "2px 0" }}>− {rupees(visit.discount)}</td>
              </tr>
            )}
            <tr style={{ fontWeight: 700, fontSize: 17 }}>
              <td colSpan={3} style={{ textAlign: "right", padding: "8px 0" }}>
                {paid ? "Total paid" : "Total due"}
              </td>
              <td style={{ textAlign: "right", padding: "8px 0" }}>{rupees(totalDue(visit))}</td>
            </tr>
          </tfoot>
        </table>

        {paid && visit.paymentMethod && (
          <p style={{ margin: "14px 0 0", fontSize: 13 }}>Paid by {PAYMENT_LABEL[visit.paymentMethod]}.</p>
        )}
        <p style={{ margin: "28px 0 0", fontSize: 12, color: "#666666" }}>
          {clinic.doctor.fullName} · {clinic.doctor.title}
        </p>
      </article>
    </main>
  );
}
