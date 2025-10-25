import { NextRequest, NextResponse } from "next/server";
import { isTokenValidWithSupabase } from "@/features/auth/services/tokenService";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const access = req.cookies.get("sb-access-token")?.value;
  const validToken = await isTokenValidWithSupabase(access);

  if (path.startsWith("/app") && !validToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectedTo", path);
    return NextResponse.redirect(url);
  }

  if ((path === "/login" || path === "/register") && validToken) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
