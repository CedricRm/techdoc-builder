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
    return res.ok;
  } catch {
    return false;
  }
}
