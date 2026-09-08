import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

/* Makes the Cloudflare bindings and env available during `next dev`.
   No effect on the production build. */
initOpenNextCloudflareForDev();
