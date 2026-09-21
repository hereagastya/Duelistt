import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// "/" is the public landing page. The check below is exact-match or a "/x/"
// prefix, so listing "/" does not make every route public: "/today" is neither
// equal to "/" nor does it start with "//".
const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth", "/api/dodo", "/api/cron"];

// Signed in, these have nothing to offer: send them to the app instead.
const SIGNED_IN_REDIRECTS = ["/", "/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getClaims() verifies the access token's signature locally against the
  // project's JWKS (ES256) using WebCrypto, so an ordinary navigation costs no
  // round trip to Supabase -- which matters because this runs on every request.
  //
  // This is NOT getSession(): a forged or tampered cookie fails the signature
  // check, and an expired token is rejected (the refresh happens inside, and
  // the rotated cookies are written through setAll above). The only path that
  // still calls the Auth server is a symmetric-key project or a runtime
  // without WebCrypto, which auth-js falls back to internally.
  const { data: claimsData } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(claimsData?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isSignedIn && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isSignedIn && SIGNED_IN_REDIRECTS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
