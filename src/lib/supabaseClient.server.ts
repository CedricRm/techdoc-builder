import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createLogger } from "@/lib/logger";

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
        /* istanbul ignore next */ _cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>
      ) {
        const log = createLogger("supabase.server");
        void _cookiesToSet;
        log.warn("Setting cookies on server is not supported in this context.");
      },
    },
  });
}
