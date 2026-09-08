import { NextResponse } from "next/server";
import { isSlotFree } from "@/lib/availability";
import { isValidEmail, isValidPhone, isVerified } from "@/lib/otp";
import { appointmentTypes, isBookable, isoFor } from "@/lib/schedule";
import { createAppointment, SlotTakenError } from "@/lib/store";

type BookingRequest = {
  type?: string;
  day?: number;
  slot?: string;
  name?: string;
  phone?: string;
  email?: string;
  age?: string;
  reason?: string;
  verificationToken?: string;
  company?: string;
};

export async function POST(request: Request) {
  let body: BookingRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { type, day, slot } = body;

  const appointmentType = appointmentTypes.find((t) => t.key === type);
  if (!appointmentType || typeof day !== "number" || !slot) {
    return NextResponse.json(
      { error: "Choose an appointment type, a date and a time." },
      { status: 400 },
    );
  }

  if (!isBookable(day)) {
    return NextResponse.json({ error: "The clinic is not open on that date." }, { status: 400 });
  }

  /* Honeypot — real submissions leave this hidden field empty. */
  if (body.company) {
    return NextResponse.json({ error: "Request rejected." }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  if (!name || !phone || !email) {
    return NextResponse.json(
      { error: "A name, phone number and email address are all required." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email) || !isValidPhone(phone)) {
    return NextResponse.json(
      { error: "Enter a valid email address and phone number." },
      { status: 400 },
    );
  }

  if (!(await isVerified(body.verificationToken, email, phone))) {
    return NextResponse.json(
      { error: "Verify your email address before requesting an appointment." },
      { status: 401 },
    );
  }

  if (!(await isSlotFree(day, slot))) {
    return NextResponse.json(
      { error: "That slot is no longer available. Choose another time." },
      { status: 409 },
    );
  }

  try {
    const appointment = await createAppointment({
      name,
      phone,
      email,
      age: body.age?.trim() || "—",
      type: appointmentType.name,
      date: isoFor(day),
      time: slot,
      reason: body.reason?.trim() || "—",
      history: "—",
    });

    /* Requests arrive as PENDING; the clinic confirms them from /staff. */
    return NextResponse.json({ reference: appointment.reference }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return NextResponse.json(
        { error: "That slot was taken while you were filling the form. Choose another time." },
        { status: 409 },
      );
    }
    throw error;
  }
}
