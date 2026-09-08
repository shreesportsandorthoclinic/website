import type { Metadata } from "next";
import { dayRows, monthCells, weekColumns } from "@/lib/practice";
import { longLabelForOffset, todayIso } from "@/lib/schedule";
import CalendarViews from "./CalendarViews";

export const metadata: Metadata = { title: "Practice — calendar" };
export const dynamic = "force-dynamic";

function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

function longLabel(iso: string) {
  const today = todayIso();
  const diff = Math.round(
    (Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000,
  );
  return longLabelForOffset(diff);
}

type Props = { searchParams: Promise<{ date?: string }> };

export default async function PracticeCalendarPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const dayIso = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? (date as string) : todayIso();

  /* Sequential, not Promise.all: these share cached reads, and the Supabase
     transaction pooler stalls when several queries are pipelined at once. */
  const rows = await dayRows(dayIso);
  const columns = await weekColumns();
  const cells = await monthCells();

  return (
    <main style={{ padding: "36px 32px 80px" }}>
      <CalendarViews
        dayRows={rows}
        weekColumns={columns}
        monthCells={cells}
        dayIso={dayIso}
        dayLabel={longLabel(dayIso)}
        prevDate={addDays(dayIso, -1)}
        nextDate={addDays(dayIso, 1)}
        isToday={dayIso === todayIso()}
      />
    </main>
  );
}
