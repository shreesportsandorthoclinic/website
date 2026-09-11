import "server-only";

import { clinic } from "./content";
import { shortDate } from "./schedule";

/* Outbound notifications.

   Two independent channels, each turned on by its own env vars:

   1. Email — booking verification codes and confirm/reschedule/cancel
      notices to the patient, plus a copy of every new-booking alert to the
      clinic's own inbox (clinic.email) — all via Resend's REST API
      (RESEND_API_KEY + NOTIFY_FROM_EMAIL). Without them, everything below
      falls back to logging to the server console so the flows stay testable
      in development; a missing or failed send never fails the booking or
      status change that triggered it.

   2. New-booking alerts to the clinic — Telegram, via the Bot API
      (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID). TELEGRAM_CHAT_ID may be a
      comma-separated list (e.g. the doctor and the front desk). SITE_URL is
      used to build the "open in staff area" link. Without the token the
      alert is logged and skipped — a booking never fails over it.

   A new booking fires both the Telegram alert and the clinic-inbox email in
   parallel — belt and braces, since a phone can be off or a message missed
   but an inbox rarely is. SMS/WhatsApp can be added here later behind the
   same functions. */

type Channel = "email" | "console";
type SendResult = { delivered: boolean; channel: Channel };

async function sendEmail(to: string, subject: string, text: string): Promise<SendResult> {
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
        body: JSON.stringify({ from, to, subject, text }),
      });
      if (res.ok) return { delivered: true, channel: "email" };
      console.error("[notify] Resend responded", res.status, await res.text().catch(() => ""));
    } catch (error) {
      console.error("[notify] Resend request failed", error);
    }
  }

  console.info(`[notify] "${subject}" to ${to}:\n${text}`);
  return { delivered: false, channel: "console" };
}

export async function sendVerificationCode(email: string, code: string): Promise<SendResult> {
  return sendEmail(
    email,
    `Your ${clinic.name} booking code: ${code}`,
    `Your verification code is ${code}.\n\n` +
      `Enter it on the booking page to confirm your appointment request. ` +
      `It expires in 10 minutes. If you did not request this, ignore this email.`,
  );
}

/* ── status-change notices to the patient ─────────────────────────────── */

type PatientAppointment = {
  name: string;
  email: string;
  type: string;
  date: string;
  time: string;
  reference: string;
};

export async function notifyAppointmentConfirmed(appt: PatientAppointment): Promise<SendResult> {
  return sendEmail(
    appt.email,
    `Appointment confirmed — ${shortDate(appt.date)} at ${appt.time}`,
    `Hi ${appt.name},\n\n` +
      `Your ${appt.type} appointment with ${clinic.name} is confirmed for ` +
      `${shortDate(appt.date)} at ${appt.time}.\n\n` +
      `Please bring any previous reports and imaging relevant to your visit.\n\n` +
      `Reference: ${appt.reference}\n\n` +
      `If you need to change this, reply to this email or call the clinic.`,
  );
}

export async function notifyAppointmentCancelled(appt: PatientAppointment): Promise<SendResult> {
  return sendEmail(
    appt.email,
    `Appointment cancelled — ${shortDate(appt.date)} at ${appt.time}`,
    `Hi ${appt.name},\n\n` +
      `Your ${appt.type} appointment with ${clinic.name} on ${shortDate(appt.date)} at ` +
      `${appt.time} has been cancelled.\n\n` +
      `Reference: ${appt.reference}\n\n` +
      `If this was not expected, or you would like to book a new time, please contact the ` +
      `clinic or use the booking page again.`,
  );
}

export async function notifyAppointmentRescheduled(
  appt: PatientAppointment,
  previousDate: string,
  previousTime: string,
): Promise<SendResult> {
  return sendEmail(
    appt.email,
    `Appointment rescheduled — new time ${shortDate(appt.date)} at ${appt.time}`,
    `Hi ${appt.name},\n\n` +
      `Your ${appt.type} appointment with ${clinic.name}, originally ${shortDate(previousDate)} ` +
      `at ${previousTime}, has been moved to:\n\n` +
      `${shortDate(appt.date)} at ${appt.time}\n\n` +
      `Reference: ${appt.reference}\n\n` +
      `If this new time does not work for you, please contact the clinic.`,
  );
}

/* ── new-booking alerts to the clinic (Telegram + email) ──────────────── */

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

async function telegramAlertNewBooking(booking: BookingAlert): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    console.info(`[notify] new booking ${booking.reference} — Telegram not configured`);
    return false;
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
  return delivered;
}

async function emailAlertNewBooking(booking: BookingAlert): Promise<SendResult> {
  const reason = booking.reason && booking.reason !== "—" ? booking.reason : "—";
  const siteUrl = process.env.SITE_URL?.replace(/\/+$/, "");
  const staffLink = siteUrl ? `${siteUrl}/staff/appointments/${booking.id}` : null;

  return sendEmail(
    clinic.email,
    `New appointment request — ${booking.name} · ${longDate(booking.date)} at ${booking.time}`,
    [
      `New appointment request`,
      ``,
      `${booking.name} · ${booking.type}`,
      `${longDate(booking.date)} at ${booking.time}`,
      ``,
      `Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Reason: ${reason}`,
      ``,
      `Reference: ${booking.reference}`,
      staffLink ? `` : null,
      staffLink ? `Open in staff area: ${staffLink}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  );
}

/** Alerts the clinic to a new request on every channel that's configured —
    Telegram (to the doctor's/front desk's phones) and email (to the clinic's
    inbox, so there's a record even if a phone is off or the message is
    missed). Either, both or neither can be wired up; a booking never fails
    because a notification could not be sent. */
export async function notifyNewBooking(
  booking: BookingAlert,
): Promise<{ telegram: boolean; email: boolean }> {
  const [telegram, email] = await Promise.all([
    telegramAlertNewBooking(booking),
    emailAlertNewBooking(booking),
  ]);
  return { telegram, email: email.delivered };
}
