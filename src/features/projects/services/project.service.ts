import { supabaseBrowser } from "@/lib/supabaseClient.browser";
import { createLogger } from "@/lib/logger";

import type { Project } from "../types";

/**
 * Fetch recent projects ordered by created_at desc.
 */
const log = createLogger("projects.service");

export async function getRecentProjects(limit = 5): Promise<Project[]> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,client,project_date")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Failed to fetch recent projects", { error, limit });
    return [];
  }
  return (data as Project[]) ?? [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,client,project_date")
    .eq("id", id)
    .single();
  if (error) {
    log.error("getProjectById failed", { message: error.message, id });
    return null;
  }
  return data as Project;
}

export async function listProjects(): Promise<Project[]> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,client,project_date")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("listProjects failed", { message: error.message });
    return [];
  }
  return (data as Project[]) ?? [];
}

export type CreateProjectInput = {
  name: string;
  client: string;
  project_date?: string | null;
};

export async function createProject(
  input: CreateProjectInput
): Promise<{ error?: string }> {
  const supabase = supabaseBrowser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    log.warn("createProject: no user", { message: userError?.message });
    return { error: userError?.message || "Non authentifié" };
  }

  const { error } = await supabase
    .from("projects")
    .insert([{ ...input, owner: user.id }]);

  if (error) {
    log.error("createProject failed", { message: error.message });
    return { error: error.message };
  }
  log.info("createProject success", { name: input.name });
  return {};
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  const supabase = supabaseBrowser();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    log.error("deleteProject failed", { message: error.message, id });
    return { error: error.message };
  }
  log.info("deleteProject success", { id });
  return {};
}
