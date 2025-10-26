// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "./lib/supabaseClient.server";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // Public and ignored paths
  const PUBLIC_PATHS = new Set(["/login", "/register"]);
  const IGNORED_PREFIXES = [
    "/_next",
    "/api",
    "/favicon",
    "/icons",
    "/assets",
    "/public",
  ];

  const isIgnored = IGNORED_PREFIXES.some((p) => path.startsWith(p));
  const isPublic = PUBLIC_PATHS.has(path);

  // Ignore system/static paths entirely
  if (isIgnored) return res;

  // Public auth routes behavior
  if (isPublic) {
    // If already logged in, keep users out of auth pages
    if (user) return NextResponse.redirect(new URL("/dashboard", req.url));
    // Not logged in: allow
    return res;
  }

  // Protect all other routes when unauthenticated
  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectedTo", path);
    return NextResponse.redirect(url);
  }

  return res;
}

// Scope explicite (identique à l'ancien middleware)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
