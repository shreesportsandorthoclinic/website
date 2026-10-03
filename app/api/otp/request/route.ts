import { NextResponse } from "next/server";
import { clinic } from "@/lib/content";
import { isEmailConfigured, sendVerificationCode } from "@/lib/notify";
import { CODE_TTL_SECONDS, requestCode } from "@/lib/otp";

export async function POST(request: Request) {
  let body: { email?: string; phone?: string; company?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  /* Honeypot: real users never fill this hidden field. */
  if (body.company) {
    return NextResponse.json({ id: "ignored", expiresInSeconds: CODE_TTL_SECONDS });
  }

  const result = await requestCode(body.email ?? "", body.phone ?? "");
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.retryAfter ? 429 : 400 },
    );
  }

  const delivery = await sendVerificationCode(result.email, result.code);

  /* The code is only ever handed back to the browser in local development
     with no email provider configured. In production, or whenever Resend is
     configured but the send failed, showing it would let anyone "verify" an
     address they don't own — so fail instead. */
  const devFallback = !isEmailConfigured() && process.env.NODE_ENV !== "production";
  if (!delivery.delivered && !devFallback) {
    return NextResponse.json(
      {
        error: `We couldn't send the verification email. Please try again in a minute, or call the clinic on ${clinic.phone}.`,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    id: result.id,
    expiresInSeconds: CODE_TTL_SECONDS,
    delivered: delivery.delivered,
    devCode: delivery.delivered ? undefined : result.code,
  });
}
