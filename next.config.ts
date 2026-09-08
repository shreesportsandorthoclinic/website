import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    /* Server Actions (staff appointment status + notes) run a CSRF check that
       compares the request Origin to the Host. Behind Cloudflare's proxy and
       a custom domain those can differ, which rejects the action. List every
       host the site is served from here. */
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "shreesportsandortho.in",
        "www.shreesportsandortho.in",
        "website.workers.dev",
        "*.workers.dev",
      ],
    },
  },
};

export default nextConfig;

/* Makes the Cloudflare bindings and env available during `next dev`.
   No effect on the production build. */
initOpenNextCloudflareForDev();
