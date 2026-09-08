import { statusInk } from "@/lib/status";
import type { Status } from "@/lib/types";

export default function StatusTag({
  status,
  fontSize = 10,
  padding,
}: {
  status: Status;
  fontSize?: number;
  padding?: string;
}) {
  return (
    <span
      className="tag"
      style={{ ...statusInk(status), fontSize, letterSpacing: "0.08em", padding }}
    >
      {status}
    </span>
  );
}
