import "server-only";

import postgres from "postgres";

/* ─────────────────────────────────────────────────────────────────────────
   The one database connection.

   Every data-access module (lib/store.ts, lib/library.ts, lib/otp.ts)
   imports `sql` from here, so this is the only file that knows how the
   database is reached.

   `DATABASE_URL` is the Supabase *transaction pooler* string — the one on
   port 6543. That pooler is built for short-lived serverless invocations
   (which is how this runs on Cloudflare), but it does not support prepared
   statements or session state, so `prepare: false` is required.

   The connection is cached on `globalThis` in development so Next.js hot
   reloads reuse it instead of opening a new pool on every code change.
   ───────────────────────────────────────────────────────────────────────── */

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Put the Supabase transaction-pooler connection " +
      "string (port 6543) in .env locally and in the Cloudflare project's " +
      "environment variables for production. See CLAUDE.md.",
  );
}

declare global {
  var __clinicSql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.__clinicSql ??
  postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__clinicSql = sql;
}
