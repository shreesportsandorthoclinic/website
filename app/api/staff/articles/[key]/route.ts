import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStaffRequest } from "@/lib/auth";
import { deleteArticle, getArticle, normaliseInput, updateArticle } from "@/lib/library";

type Params = { params: Promise<{ key: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await isStaffRequest(request))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { key } = await params;
  const article = await getArticle(key);
  if (!article) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await isStaffRequest(request))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { key } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const normalised = normaliseInput(body);
  if (!normalised) {
    return NextResponse.json({ error: "A title and a category are required." }, { status: 400 });
  }

  const article = await updateArticle(key, normalised);
  if (!article) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ article });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isStaffRequest(request))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { key } = await params;
  const ok = await deleteArticle(key);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
