import { NextResponse } from "next/server";
import { sendVerificationCode } from "@/lib/notify";
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

  return NextResponse.json({
    id: result.id,
    expiresInSeconds: CODE_TTL_SECONDS,
    delivered: delivery.delivered,
    /* When there is no email provider configured (e.g. local dev) the code is
       returned so the flow can be completed. Never happens once RESEND_API_KEY
       is set in production. */
    devCode: delivery.delivered ? undefined : result.code,
  });
}
