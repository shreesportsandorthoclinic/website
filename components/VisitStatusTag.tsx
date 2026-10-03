import type { VisitStatus } from "@/lib/billing-shared";

const LOOK: Record<VisitStatus, { className: string; label: string }> = {
  AT_RECEPTION: { className: "tag tag-accent-2", label: "At reception" },
  PAID: { className: "tag tag-accent", label: "Paid" },
  VOID: { className: "tag tag-neutral", label: "Withdrawn" },
};

export default function VisitStatusTag({ status }: { status: VisitStatus }) {
  const look = LOOK[status];
  return (
    <span className={look.className} style={{ fontSize: 10, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
      {look.label.toUpperCase()}
    </span>
  );
}
