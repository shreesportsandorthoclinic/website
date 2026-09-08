import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

/* Deployment sanity check. Reports whether the required env vars are visible
   to the running server and whether the database answers a trivial query.
   Never returns a secret value — only whether each one is present.

   Safe to leave in place; it exposes nothing sensitive. Remove it later if
   you would rather not advertise the stack. */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    STAFF_SESSION_SECRET: Boolean(process.env.STAFF_SESSION_SECRET),
    STAFF_EMAIL: Boolean(process.env.STAFF_EMAIL),
    STAFF_PASSWORD: Boolean(process.env.STAFF_PASSWORD),
    SITE_URL: process.env.SITE_URL ?? null,
  };

  let database: string;
  try {
    const sql = getSql();
    const [row] = await sql<{ ok: number }[]>`select 1 as ok`;
    database = row?.ok === 1 ? "ok" : "unexpected result";
  } catch (error) {
    database = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  return NextResponse.json({ env, database }, { status: database === "ok" ? 200 : 503 });
}
