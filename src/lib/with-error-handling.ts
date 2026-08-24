import "server-only";
import { NextResponse } from "next/server";

// Route handlers that call Supabase (or anything else that can throw
// synchronously, e.g. a missing env var) with nothing catching it: on
// Cloudflare Workers an uncaught exception comes back as a bare,
// empty-body 500 -- no error message at all, just "Unexpected end of
// JSON input" client-side once the caller tries to parse it as JSON.
// Wrapping a handler in this surfaces the real error instead.
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Route error:", err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
