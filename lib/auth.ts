/* Minimal staff authentication.

   A single shared credential (STAFF_EMAIL / STAFF_PASSWORD) gates the whole
   /staff area and its APIs. On success we set a cookie holding a token that
   is an HMAC over a fixed payload plus an issue timestamp, signed with
   STAFF_SESSION_SECRET. The middleware and the API routes verify it.

   This is deliberately simple. If the clinic later needs per-user logins,
   roles or an audit trail, replace this with a real auth provider — every
   check goes through the helpers below, so no page or route changes. */

export const SESSION_COOKIE = "sso_staff_session";

/** Sessions are valid for 7 days. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.STAFF_SESSION_SECRET || "insecure-fallback-secret";
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(sig);
}

export function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.STAFF_EMAIL;
  const expectedPassword = process.env.STAFF_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
}

export async function createSessionToken() {
  const issued = Date.now().toString();
  const payload = `staff.${issued}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, issued, sig] = parts;
  if (prefix !== "staff") return false;
  const expected = await sign(`${prefix}.${issued}`);
  if (sig !== expected) return false;
  const age = (Date.now() - Number(issued)) / 1000;
  return age >= 0 && age < MAX_AGE_SECONDS;
}

/** True when the request carries a valid staff session cookie. */
export async function isStaffRequest(request: { cookies: { get(name: string): { value: string } | undefined } }) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

/** For Server Actions: throws unless the caller has a valid staff session.
    (`proxy.ts` already gates /staff, but Server Actions warrant their own
    check — see the Next.js data-security guide.) */
export async function requireStaffSession() {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    throw new Error("Not signed in.");
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};
