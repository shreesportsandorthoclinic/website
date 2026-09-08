import "server-only";

import { cache } from "react";
import postgres from "postgres";

/* ─────────────────────────────────────────────────────────────────────────
   The database client — one per request.

   Cloudflare Workers close every socket at the end of the request that
   opened it. A long-lived, module-scope client whose connection is reused
   across requests therefore hangs the *next* request when it reaches for a
   socket that no longer exists ("Worker's code had hung and would never
   generate a response").

   `cache()` from React scopes one client to one request: every query in a
   request shares it, and the next request builds a fresh one. Supabase's
   transaction pooler (the port-6543 `DATABASE_URL`) keeps the real
   connection pool on its side, so opening a client per request is cheap.

   Every data-access module calls `getSql()` at the top of each function:

     export async function listSomething() {
       const sql = getSql();
       return sql`select ...`;
     }

   Options that matter on the Workers runtime:
     prepare: false      the transaction pooler holds no session state
     fetch_types: false  skip the pg_type introspection round-trip, which
                         hangs on workerd
     max: 1              one socket; the pooler does the real pooling
   ───────────────────────────────────────────────────────────────────────── */

export const getSql = cache(() => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Put the Supabase transaction-pooler string " +
        "(port 6543) in .env locally and in the Cloudflare Worker's " +
        "environment variables for production. See CLAUDE.md.",
    );
  }
  return postgres(url, {
    prepare: false,
    fetch_types: false,
    max: 1,
    idle_timeout: 10,
    connect_timeout: 15,
  });
});
