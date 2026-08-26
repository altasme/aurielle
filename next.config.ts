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
  // worker-mailer's ESM build has a top-level `import { connect } from
  // "cloudflare:sockets"`. Left to Turbopack, that import gets rewritten
  // into a `require("cloudflare:sockets")` call inside Turbopack's own
  // compiled chunk (visible in .next/server/chunks/
  // node_modules_worker-mailer_dist_index_mjs_*.js) before OpenNext's
  // esbuild pass ever runs -- and the Workers runtime can load
  // `cloudflare:sockets` via a real import, but rejects a require() of
  // it outright ("Dynamic require ... is not supported"). Excluding the
  // package from Next's own bundling leaves its source untouched, so
  // the clean import survives all the way to the deployed Worker.
  serverExternalPackages: ["worker-mailer"],
};

export default nextConfig;

// Makes Cloudflare bindings (env vars, R2, KV, etc.) available to
// `next dev` the same way they'd be available in the deployed Worker.
// No-ops outside of `next dev`.
initOpenNextCloudflareForDev();
