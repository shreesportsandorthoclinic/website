import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PracticeNav from "@/components/PracticeNav";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export default async function PracticeLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    redirect("/staff/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <PracticeNav />
      {children}
    </div>
  );
}
