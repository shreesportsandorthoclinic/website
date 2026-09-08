import { updateStatusAction } from "@/app/staff/actions";
import type { Status } from "@/lib/types";

type Props = {
  id: string;
  status: Status;
  label: string;
  className?: string;
  style?: React.CSSProperties;
};

/** A single-purpose form so status changes work without client JavaScript. */
export default function StatusButton({ id, status, label, className, style }: Props) {
  return (
    <form action={updateStatusAction} style={{ display: "contents" }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={className ?? "btn btn-secondary"} type="submit" style={style}>
        {label}
      </button>
    </form>
  );
}
