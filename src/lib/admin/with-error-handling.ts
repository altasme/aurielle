import "server-only";
import { NextResponse } from "next/server";

// Every admin API route calls getSessionAdminUser() / Supabase / etc.
// synchronously-throwing on things like a missing env var, with nothing
// catching it. On Cloudflare Workers an uncaught exception in a route
// handler comes back as a bare, empty-body 500 -- no error message at
// all, just "Unexpected end of JSON input" client-side once the caller
// tries to parse it as JSON. Wrapping every handler in this surfaces
// the real error instead.
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Admin route error:", err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
