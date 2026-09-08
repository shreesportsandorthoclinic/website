import type { Status } from "./types";

/* Client-safe: the status palette is used inside client components too, so it
   must not live alongside anything that touches the store. */
export function statusInk(status: Status): { background: string; color: string } {
  switch (status) {
    case "CONFIRMED":
      return { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
    case "PENDING":
      return { background: "var(--color-accent-2-100)", color: "var(--color-accent-2-800)" };
    case "CANCELLED":
      return { background: "var(--color-neutral-200)", color: "var(--color-neutral-700)" };
    case "COMPLETED":
      return { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" };
    case "NO-SHOW":
      return { background: "var(--color-neutral-900)", color: "var(--color-neutral-100)" };
    default:
      return { background: "var(--color-accent-200)", color: "var(--color-accent-900)" };
  }
}
