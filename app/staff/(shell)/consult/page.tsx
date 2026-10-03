import type { Metadata } from "next";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import { getPriceList, visitsOn } from "@/lib/billing";
import { todayLabel } from "@/lib/practice";
import { todayIso } from "@/lib/schedule";
import { appointmentsOn } from "@/lib/store";
import { occupiesSlot } from "@/lib/types";
import ConsultDesk from "./ConsultDesk";

export const metadata: Metadata = { title: "Practice — consult" };
export const dynamic = "force-dynamic";

export default async function ConsultPage() {
  const today = todayIso();
  /* Sequential, not Promise.all: the Supabase transaction pooler stalls when
     several queries are pipelined at once. */
  const appointments = (await appointmentsOn(today)).filter((a) => occupiesSlot(a.status));
  const prices = await getPriceList();
  const visits = await visitsOn(today);

  const unpriced = Object.values(prices).every((list) => list.length === 0);

  return (
    <main style={{ padding: "36px 32px 80px", maxWidth: 1280 }}>
      <AutoRefresh seconds={10} />
      <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Consult</h1>
      <p style={{ fontSize: 16, color: "var(--color-neutral-700)", margin: "0 0 32px", maxWidth: "62ch" }}>
        {todayLabel()}. Choose the patient, tick what they had, and send it to the desk — reception
        sees the bill straight away and takes payment.
      </p>

      {unpriced ? (
        <p style={{ fontSize: 15 }}>
          The price list is empty. <Link href="/staff/prices">Set up prices</Link> first, then come
          back here.
        </p>
      ) : (
        <ConsultDesk
          appointments={appointments.map((a) => ({
            id: a.id,
            name: a.name,
            phone: a.phone,
            age: a.age,
            time: a.time,
            type: a.type,
          }))}
          prices={prices}
          visits={visits}
        />
      )}
    </main>
  );
}
