import type { Metadata } from "next";
import { dayRows, monthCells, weekColumns } from "@/lib/practice";
import CalendarViews from "./CalendarViews";

export const metadata: Metadata = { title: "Practice — calendar" };
export const dynamic = "force-dynamic";

export default async function PracticeCalendarPage() {
  const [rows, columns, cells] = await Promise.all([dayRows(), weekColumns(), monthCells()]);

  return (
    <main style={{ padding: "36px 32px 80px" }}>
      <CalendarViews dayRows={rows} weekColumns={columns} monthCells={cells} />
    </main>
  );
}
