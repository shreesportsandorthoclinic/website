import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/otp";

export async function POST(request: Request) {
  let body: { id?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!body.id || !body.code) {
    return NextResponse.json({ error: "Enter the code you were sent." }, { status: 400 });
  }

  const result = await verifyCode(body.id, body.code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ token: result.token });
}
