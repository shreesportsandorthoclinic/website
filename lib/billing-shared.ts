/* Types and money math for the consult → billing flow. No database access,
   so client components can import it. Queries live in lib/billing.ts. */

export const CATEGORIES = ["consultation", "radiology", "procedure"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  consultation: "Consultation",
  radiology: "Radiology",
  procedure: "Procedure",
};

export const PAYMENT_METHODS = ["CASH", "UPI", "CARD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
};

export type PriceItem = {
  id: string;
  category: Category;
  name: string;
  /** Whole rupees. */
  price: number;
  sort: number;
};

/** One line on a bill — a copy of the price item at the time it was sent. */
export type BillLine = {
  category: Category | "other";
  name: string;
  price: number;
  qty: number;
  /** Added at the desk rather than by the doctor; reception may remove it. */
  byReception?: boolean;
};

export type VisitStatus = "AT_RECEPTION" | "PAID" | "VOID";

export type Visit = {
  id: string;
  date: string;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  appointmentId: string | null;
  items: BillLine[];
  doctorNote: string;
  status: VisitStatus;
  discount: number;
  paymentMethod: PaymentMethod | null;
  billNo: number | null;
  createdAt: string;
  paidAt: string | null;
};

export function rupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function subtotal(items: BillLine[]) {
  return items.reduce((sum, line) => sum + line.price * line.qty, 0);
}

export function totalDue(visit: Pick<Visit, "items" | "discount">) {
  return Math.max(subtotal(visit.items) - visit.discount, 0);
}

/** "B-000042" */
export function billNumber(n: number | null) {
  return n == null ? "—" : `B-${String(n).padStart(6, "0")}`;
}
