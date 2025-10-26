import { supabaseBrowser } from "@/lib/supabaseClient.browser";
import { createLogger } from "@/lib/logger";

const supabase = supabaseBrowser();
const log = createLogger("auth.service");

export async function signUpUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) {
    log.error("signUp failed", { message: error.message });
  } else {
    log.info("signUp success", { email });
  }
  return { data, error };
}

export async function signInUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    log.warn("signIn failed", { message: error.message });
  } else {
    log.info("signIn success", { email });
  }
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    log.warn("signOut failed", { message: error.message });
  } else {
    log.info("signOut success");
  }
  return { error };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    log.error("getCurrentUser failed", { message: error.message });
  }
  return { user: data?.user ?? null, error };
}
