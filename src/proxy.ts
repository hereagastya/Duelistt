import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed Middleware to Proxy. Same behaviour, new file name and
// export: `proxy.ts` beside `app/`, exporting `proxy`.
export async function proxy(request: NextRequest) {
  /*
    When Supabase cannot match a redirectTo against its allowlist it does not
    fail loudly: it falls back to the project's Site URL, so the OAuth code
    arrives at "/" and the visitor is left looking at the landing page with a
    ?code= in the address bar, still signed out.

    Rather than rely on dashboard configuration staying correct forever, hand
    any code that lands on the root to the route that knows what to do with it.
    Scoped to "/" so it cannot interfere with anything else that uses ?code=.
  */
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
