import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/* Gate the whole practice area behind the staff session cookie. The shell
   layout and the /api/staff routes verify the session again — this proxy is
   for a clean redirect to the login screen. */

export const config = {
  matcher: ["/staff/:path*", "/api/staff/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/staff/login";
  const isLoginApi = pathname === "/api/staff/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (valid) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const loginUrl = new URL("/staff/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}
