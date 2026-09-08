import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStaffRequest } from "@/lib/auth";
import { createArticle, listArticles, normaliseInput, type ArticleInput } from "@/lib/library";

export async function GET(request: NextRequest) {
  if (!(await isStaffRequest(request))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ articles: await listArticles() });
}

export async function POST(request: NextRequest) {
  if (!(await isStaffRequest(request))) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: Partial<ArticleInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const normalised = normaliseInput(body);
  if (!normalised) {
    return NextResponse.json({ error: "A title and a category are required." }, { status: 400 });
  }

  const article = await createArticle(normalised);
  return NextResponse.json({ article }, { status: 201 });
}
