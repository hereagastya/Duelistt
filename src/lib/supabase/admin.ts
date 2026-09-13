import "server-only";

import { createClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS entirely -- only for the Dodo webhook
// (which writes billing columns the user is not granted) and the digest cron
// (which reads across all users). Never import this into anything reachable
// from a browser request handler that trusts user input.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
