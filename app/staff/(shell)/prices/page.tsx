import type { Metadata } from "next";
import { getPriceList } from "@/lib/billing";
import PriceEditor from "./PriceEditor";

export const metadata: Metadata = { title: "Practice — prices" };
export const dynamic = "force-dynamic";

export default async function PricesPage() {
  const prices = await getPriceList();

  return (
    <main style={{ padding: "36px 32px 80px", maxWidth: 1100 }}>
      <h1 style={{ fontSize: 36, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Price list</h1>
      <p style={{ fontSize: 16, color: "var(--color-neutral-700)", margin: "0 0 36px", maxWidth: "62ch" }}>
        What the doctor can pick on the Consult screen, and what reception charges for it. Changing a
        price here affects new bills only — bills already sent keep the price they were sent with.
      </p>
      <PriceEditor prices={prices} />
    </main>
  );
}
