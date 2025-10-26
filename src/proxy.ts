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

  // Protect /app/*
  if (path.startsWith("/app") && !user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectedTo", path);
    return NextResponse.redirect(url);
  }

  // Prevent access to /login and /register if already logged in
  if ((path === "/login" || path === "/register") && user) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return res;
}

// Scope explicite (identique à l'ancien middleware)
export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
