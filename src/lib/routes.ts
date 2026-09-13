const STATIC_DESTINATIONS = [
  "/today",
  "/prospects",
  "/prospects/new",
  "/settings",
  "/billing",
] as const;

export type Destination = (typeof STATIC_DESTINATIONS)[number] | `/prospects/${string}`;

/**
 * Where to land after sign-in or an email link. `?next=` is attacker-
 * controllable, so it is matched against known routes rather than merely
 * checked for a leading slash: "//evil.com" passes a startsWith("/") test and
 * browsers treat it as a protocol-relative URL, which is an open redirect.
 */
export function safeDestination(value: string): Destination {
  if ((STATIC_DESTINATIONS as readonly string[]).includes(value)) {
    return value as Destination;
  }
  // Prospect detail is the only dynamic route worth preserving across a login.
  if (/^\/prospects\/[0-9a-f-]{36}$/i.test(value)) {
    return value as Destination;
  }
  return "/today";
}
