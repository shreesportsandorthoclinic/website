import "server-only";

import { getSql } from "./db";

/* One-time-code verification for the public booking form.

   A visitor must prove they control the email address they are booking with
   before a request reaches the clinic. This blocks the obvious abuse — a
   script firing hundreds of fake bookings — because each one now needs a
   working inbox and a fresh code.

   Codes live in the `otp_codes` table (db/schema.sql). Delivery goes through
   lib/notify.ts. */

export const CODE_TTL_SECONDS = 10 * 60;
const VERIFY_TOKEN_TTL_SECONDS = 30 * 60;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_ACTIVE_PER_EMAIL = 4;
const MAX_ATTEMPTS = 5;

export function normaliseEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalisePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  const digits = normalisePhone(value);
  return digits.length >= 7 && digits.length <= 15;
}

function newId() {
  return `otp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function secret() {
  return process.env.STAFF_SESSION_SECRET || "insecure-fallback-secret";
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
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type RequestResult =
  | { ok: true; id: string; code: string; email: string; phone: string }
  | { ok: false; error: string; retryAfter?: number };

export async function requestCode(rawEmail: string, rawPhone: string): Promise<RequestResult> {
  const email = normaliseEmail(rawEmail);
  const phone = normalisePhone(rawPhone);

  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if (!isValidPhone(rawPhone)) return { ok: false, error: "Enter a valid phone number." };

  const sql = getSql();

  /* Opportunistic cleanup of long-dead rows so the table cannot grow without
     bound. Anything older than an hour is well past any TTL. */
  await sql`delete from otp_codes where expires_at < now() - interval '1 hour'`;

  const now = Date.now();
  const mine = await sql<{ created_at: Date; expires_at: Date }[]>`
    select created_at, expires_at from otp_codes
    where email = ${email} and verified = false
  `;

  const newest = mine.reduce((max, r) => Math.max(max, r.created_at.getTime()), 0);
  if (newest && now - newest < RESEND_COOLDOWN_SECONDS * 1000) {
    return {
      ok: false,
      error: "A code was just sent. Wait a few seconds before asking for another.",
      retryAfter: Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - (now - newest)) / 1000),
    };
  }
  if (mine.filter((r) => r.expires_at.getTime() > now).length >= MAX_ACTIVE_PER_EMAIL) {
    return { ok: false, error: "Too many codes requested. Try again later." };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const id = newId();
  await sql`
    insert into otp_codes (id, email, phone, code, expires_at)
    values (${id}, ${email}, ${phone}, ${code}, ${new Date(now + CODE_TTL_SECONDS * 1000)})
  `;
  return { ok: true, id, code, email, phone };
}

export type VerifyResult = { ok: true; token: string } | { ok: false; error: string };

export async function verifyCode(id: string, rawCode: string): Promise<VerifyResult> {
  const code = rawCode.replace(/[^\d]/g, "");
  const sql = getSql();

  const [record] = await sql<
    { email: string; phone: string; code: string; attempts: number; expires_at: Date }[]
  >`select email, phone, code, attempts, expires_at from otp_codes where id = ${id}`;

  if (!record) return { ok: false, error: "This code has expired. Request a new one." };
  if (Date.now() > record.expires_at.getTime()) {
    return { ok: false, error: "This code has expired. Request a new one." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many incorrect attempts. Request a new code." };
  }
  if (record.code !== code) {
    await sql`update otp_codes set attempts = attempts + 1 where id = ${id}`;
    return { ok: false, error: "That code is not correct." };
  }

  await sql`update otp_codes set verified = true where id = ${id}`;

  const body = base64url(JSON.stringify({ e: record.email, p: record.phone, i: Date.now() }));
  return { ok: true, token: `${body}.${await sign(body)}` };
}

function base64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

/** True when `token` is a valid, unexpired proof that this email + phone were verified. */
export async function isVerified(token: string | undefined, rawEmail: string, rawPhone: string) {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  if (sig !== (await sign(body))) return false;

  let payload: { e?: string; p?: string; i?: number };
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (payload.e !== normaliseEmail(rawEmail) || payload.p !== normalisePhone(rawPhone)) return false;
  const age = (Date.now() - Number(payload.i)) / 1000;
  return age >= 0 && age < VERIFY_TOKEN_TTL_SECONDS;
}
