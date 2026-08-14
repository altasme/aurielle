import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Skip Next's image-optimization loader (needs an extra Cloudflare
    // Images binding we haven't set up): serve the pre-sized static
    // files in public/images/ as-is. next/image still gives us lazy
    // loading and layout-stable width/height.
    unoptimized: true,
  },
};

export default nextConfig;

// Makes Cloudflare bindings (env vars, R2, KV, etc.) available to
// `next dev` the same way they'd be available in the deployed Worker.
// No-ops outside of `next dev`.
initOpenNextCloudflareForDev();
