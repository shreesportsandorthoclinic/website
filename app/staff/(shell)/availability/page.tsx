import type { Metadata } from "next";
import { getAvailabilityRows, getCurrentBlocks } from "@/lib/practice";
import AvailabilityEditor from "./AvailabilityEditor";

export const metadata: Metadata = { title: "Practice — availability" };
export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  /* Sequential, not Promise.all: the Supabase transaction pooler stalls when
     several queries are pipelined at once. */
  const rows = await getAvailabilityRows();
  const blocks = await getCurrentBlocks();

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

      <AvailabilityEditor rows={rows} blocks={blocks} />
    </main>
  );
}
