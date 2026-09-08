import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/* Default configuration: the Next.js server runs as a single Cloudflare
   Worker, static assets are served from the ASSETS binding. No R2
   incremental cache is wired up yet — the pages that use `revalidate`
   (the About page, the Google-reviews fetch) fall back to per-isolate
   in-memory caching, which is fine at this traffic level. Add
   `r2IncrementalCache` here if that changes. */
export default defineCloudflareConfig();
