import type { Metadata } from "next";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import { openVisits, visitsOn } from "@/lib/billing";
import {
  billNumber,
  PAYMENT_LABEL,
  PAYMENT_METHODS,
  rupees,
  totalDue,
} from "@/lib/billing-shared";
import { todayLabel } from "@/lib/practice";
import { todayIso } from "@/lib/schedule";
import BillCard from "./BillCard";

export const metadata: Metadata = { title: "Practice — billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  /* Sequential, not Promise.all — see lib/practice.ts. */
  const waiting = await openVisits();
  const paid = (await visitsOn(todayIso())).filter((v) => v.status === "PAID").reverse();

  const collected = paid.reduce((sum, v) => sum + totalDue(v), 0);
  const tiles = [
    { label: "Waiting to pay", value: String(waiting.length), accent: waiting.length > 0 },
    { label: "Collected today", value: rupees(collected), accent: false },
    ...PAYMENT_METHODS.map((m) => ({
      label: PAYMENT_LABEL[m],
      value: rupees(paid.filter((v) => v.paymentMethod === m).reduce((s, v) => s + totalDue(v), 0)),
      accent: false,
    })),
  ];

  return (
    <main style={{ padding: "36px 32px 80px", maxWidth: 1280 }}>
      <AutoRefresh seconds={6} chimeOn={waiting.length} />
      <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Billing</h1>
      <p style={{ fontSize: 16, color: "var(--color-neutral-700)", margin: "0 0 28px", maxWidth: "62ch" }}>
        {todayLabel()}. Bills appear here as soon as the doctor sends them — this page updates by
        itself and chimes when a new one arrives.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 1,
          background: "var(--color-divider)",
          border: "1px solid var(--color-divider)",
          marginBottom: 40,
        }}
      >
        {tiles.map((tile) => (
          <div key={tile.label} style={{ background: "var(--color-bg)", padding: 20 }}>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: tile.accent ? "var(--color-accent-2-700)" : "var(--color-neutral-700)",
                margin: "0 0 8px",
              }}
            >
              {tile.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 30,
                fontWeight: 600,
                margin: 0,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                color: tile.accent ? "var(--color-accent-2-700)" : undefined,
              }}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: 48 }}>
        <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
          Waiting to pay
        </h2>
        {waiting.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>
            No bills waiting. New ones from the doctor show up here.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 18 }}>
            {waiting.map((v) => (
              <BillCard key={v.id} visit={v} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="sec-h" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 16 }}>
          Paid today
        </h2>
        {paid.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>Nothing collected yet today.</p>
        ) : (
          <table className="table" style={{ fontSize: 15 }}>
            <thead>
              <tr>
                <th>Bill</th>
                <th>Patient</th>
                <th>Paid by</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paid.map((v) => (
                <tr key={v.id}>
                  <td style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{billNumber(v.billNo)}</td>
                  <td>{v.patientName}</td>
                  <td>{v.paymentMethod ? PAYMENT_LABEL[v.paymentMethod] : "—"}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{rupees(totalDue(v))}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link className="btn btn-ghost" href={`/staff/billing/${v.id}`} style={{ fontSize: 13 }}>
                      Print bill
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
