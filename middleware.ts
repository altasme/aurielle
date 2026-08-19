import { NextResponse, type NextRequest } from "next/server";

// admin-aurielle.altasme.com is the same Worker/deployment as the public
// site (see README "Admin panel"), reached via a second custom domain
// rather than a separate deploy. Nothing else in the app routes on
// hostname, so without this the domain's root "/" would show the public
// marketing homepage instead of the admin panel. This only rewrites the
// bare root -- every other path (including /admin/* itself) is left
// alone, so admin nav links and the public site both keep working
// exactly as before on both domains.
//
// Edge middleware, not a Server Component reading headers(): this does
// not force any page into dynamic rendering (see git history/README for
// why that distinction matters -- an earlier attempt at hiding the
// public header/footer via headers() in the root layout silently made
// every static page dynamic; this is a different, routing-level
// mechanism that doesn't have that effect).
const ADMIN_HOST = "admin-aurielle.altasme.com";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === ADMIN_HOST || host.startsWith(`${ADMIN_HOST}:`)) {
    return NextResponse.rewrite(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
