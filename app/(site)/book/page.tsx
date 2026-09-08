import type { Metadata } from "next";
import { getBookingWindow } from "@/lib/schedule-store";
import BookFlow from "./BookFlow";

export const metadata: Metadata = {
  title: "Book an appointment — Shree Sports & Ortho Clinic",
  description:
    "Request an appointment with Dr. Neel at Shree Sports & Ortho Clinic, Electronic City Phase-1, Bengaluru.",
};

/* The bookable-day list depends on the clinic's live hours and closures, so
   this page is rendered per request. */
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const initialWindow = await getBookingWindow();
  return <BookFlow initialWindow={initialWindow} />;
}
