import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { safeDestination } from "@/lib/routes";

const NEXT_COOKIE = "duelistt-next";

// Handles the return trip for email confirmation, magic links and OAuth.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  /*
    The destination may arrive either as a query param (email links, which we
    build ourselves) or in a cookie (OAuth, where redirectTo has to stay bare so
    it matches Supabase's allowlist exactly). Either way it is run through
    safeDestination, because both are attacker-reachable.
  */
  const next =
    searchParams.get("next") ??
    (request.cookies.get(NEXT_COOKIE)?.value
      ? decodeURIComponent(request.cookies.get(NEXT_COOKIE)!.value)
      : null) ??
    "/today";

  const landing = (path: string) => {
    const response = NextResponse.redirect(`${origin}${path}`);
    response.cookies.delete(NEXT_COOKIE);
    return response;
  };

  if (!code) {
    return landing("/login?error=missing_code");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return landing("/login?error=expired_link");
  }

  return landing(safeDestination(next));
}
