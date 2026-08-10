import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Makes Cloudflare bindings (env vars, R2, KV, etc.) available to
// `next dev` the same way they'd be available in the deployed Worker.
// No-ops outside of `next dev`.
initOpenNextCloudflareForDev();
