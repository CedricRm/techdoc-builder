import { createLogger } from "@/lib/logger";

const log = createLogger("auth.tokenService");
/**
 * Checks if the token is valid with Supabase
 * @param token The access token to verify
 * @returns True if the token is valid, false otherwise
 */
export async function isTokenValidWithSupabase(
  token?: string
): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      // Avoid logging the raw token
      log.warn("Supabase token validation failed", { status: res.status });
    }
    return res.ok;
  } catch (error) {
    log.error("Supabase token validation error", {
      error: (error as Error)?.message,
    });
    return false;
  }
}
