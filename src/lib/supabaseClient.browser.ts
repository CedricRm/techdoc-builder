import { createBrowserClient } from "@supabase/ssr";

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
