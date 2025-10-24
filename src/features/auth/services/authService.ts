import { supabaseBrowser } from "@/lib/supabaseClient";

const supabase = supabaseBrowser();

export async function signUpUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  return await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
}

export async function signInUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user ?? null, error };
}
