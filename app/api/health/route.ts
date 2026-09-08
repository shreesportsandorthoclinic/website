import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSql } from "@/lib/db";

/* Deployment sanity check. Reports whether the required config is visible to
   the running server and whether the database answers a trivial query.
   Never returns a secret value — only whether each one is present.

   `process` is what the app code reads; `cloudflareEnv` is the raw Worker
   binding object. If a secret shows up in `cloudflareEnv` but not `process`,
   the nodejs_compat_populate_process_env flag is missing. If it is in
   neither, the secret is not attached to the Worker at all.

   Safe to leave in place; it exposes nothing sensitive. */
export async function GET() {
  const KEYS = ["DATABASE_URL", "STAFF_SESSION_SECRET", "STAFF_EMAIL", "STAFF_PASSWORD", "SITE_URL"];

  const fromProcess: Record<string, boolean> = {};
  for (const key of KEYS) fromProcess[key] = Boolean(process.env[key]);

  const fromCloudflare: Record<string, boolean> | string = (() => {
    try {
      const env = getCloudflareContext().env as Record<string, unknown>;
      const out: Record<string, boolean> = {};
      for (const key of KEYS) out[key] = Boolean(env[key]);
      return out;
    } catch (error) {
      return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
  })();

  let database: string;
  try {
    const sql = getSql();
    const [row] = await sql<{ ok: number }[]>`select 1 as ok`;
    database = row?.ok === 1 ? "ok" : "unexpected result";
  } catch (error) {
    database = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  return NextResponse.json(
    { process: fromProcess, cloudflareEnv: fromCloudflare, database },
    { status: database === "ok" ? 200 : 503 },
  );
}
