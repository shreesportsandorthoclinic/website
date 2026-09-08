import "server-only";

import { clinic } from "./content";

/* Outbound notifications (currently just the booking verification code).

   Delivery is pluggable. If RESEND_API_KEY and NOTIFY_FROM_EMAIL are set the
   code is emailed via Resend's REST API (no SDK needed). Otherwise it is
   logged to the server console so the flow is testable in development.

   To turn this on in production:
     1. Add the Resend integration from the Vercel Marketplace (or set the
        env vars manually).
     2. Set NOTIFY_FROM_EMAIL to a verified sender on your domain.
   SMS/WhatsApp can be added here later behind the same function. */

type Channel = "email" | "console";

export async function sendVerificationCode(
  email: string,
  code: string,
): Promise<{ delivered: boolean; channel: Channel }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;

  if (apiKey && from) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: `Your ${clinic.name} booking code: ${code}`,
          text:
            `Your verification code is ${code}.\n\n` +
            `Enter it on the booking page to confirm your appointment request. ` +
            `It expires in 10 minutes. If you did not request this, ignore this email.`,
        }),
      });
      if (res.ok) return { delivered: true, channel: "email" };
      console.error("[notify] Resend responded", res.status, await res.text().catch(() => ""));
    } catch (error) {
      console.error("[notify] Resend request failed", error);
    }
  }

  console.info(`[notify] verification code for ${email}: ${code}`);
  return { delivered: false, channel: "console" };
}
