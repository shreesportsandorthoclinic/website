import "server-only";

import { clinic } from "./content";

/* Outbound notifications.

   Two independent channels, each turned on by its own env vars:

   1. Booking verification codes to the patient — email, via Resend's REST
      API (RESEND_API_KEY + NOTIFY_FROM_EMAIL). Without them the code is
      logged to the server console so the flow is testable in development.

   2. New-booking alerts to the clinic — Telegram, via the Bot API
      (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID). TELEGRAM_CHAT_ID may be a
      comma-separated list (e.g. the doctor and the front desk). SITE_URL is
      used to build the "open in staff area" link. Without the token the
      alert is logged and skipped — a booking never fails because a
      notification could not be sent.

   SMS/WhatsApp can be added here later behind the same functions. */

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

/* ── new-booking alert to the clinic (Telegram) ───────────────────────── */

type BookingAlert = {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  date: string;
  time: string;
  reason: string;
  reference: string;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function longDate(iso: string) {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function notifyNewBooking(booking: BookingAlert): Promise<{ delivered: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    console.info(`[notify] new booking ${booking.reference} — Telegram not configured`);
    return { delivered: false };
  }

  const siteUrl = process.env.SITE_URL?.replace(/\/+$/, "");
  const staffLink = siteUrl ? `${siteUrl}/staff/appointments/${booking.id}` : null;

  const reason = booking.reason && booking.reason !== "—" ? booking.reason : "";
  const text = [
    "🗓️ <b>New appointment request</b>",
    "",
    `<b>${escapeHtml(booking.name)}</b> · ${escapeHtml(booking.type)}`,
    `${escapeHtml(longDate(booking.date))} at ${escapeHtml(booking.time)}`,
    "",
    `📞 ${escapeHtml(booking.phone)}`,
    `✉️ ${escapeHtml(booking.email)}`,
    reason ? `\n📝 ${escapeHtml(reason)}` : "",
    "",
    `Ref ${escapeHtml(booking.reference)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const replyMarkup = staffLink
    ? { inline_keyboard: [[{ text: "Open in staff area →", url: staffLink }]] }
    : undefined;

  let delivered = false;
  for (const chatId of chatIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
          disable_web_page_preview: true,
        }),
      });
      if (res.ok) delivered = true;
      else
        console.error("[notify] Telegram responded", res.status, await res.text().catch(() => ""));
    } catch (error) {
      console.error("[notify] Telegram request failed", error);
    }
  }
  return { delivered };
}
