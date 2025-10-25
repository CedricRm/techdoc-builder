import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase public URL ou ANON KEY non définis dans l'environnement."
    );
  }
  return createBrowserClient(url, anonKey);
};

export function supabaseServer() {
  const cookieStore = cookies();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase URL ou clé serveur non définis dans l'environnement."
    );
  }
  return createServerClient(url, serviceKey, {
    cookies: {
      async getAll() {
        const store = await Promise.resolve(cookieStore);
        const allCookies = store.getAll();
        return allCookies.map((cookie: { name: string; value: string }) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(
        _cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>
      ) {
        console.warn(
          "Setting cookies on server is not supported in this context."
        );
      },
    },
  });
}
