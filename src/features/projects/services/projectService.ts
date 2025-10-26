import { supabaseServer } from "@/lib/supabaseClient.server";
import { createLogger } from "@/lib/logger";
import type { Project } from "../types";

/**
 * Fetch recent projects ordered by created_at desc.
 */
const log = createLogger("projects.service");

export async function getRecentProjects(limit = 5): Promise<Project[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,client,date")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Failed to fetch recent projects", { error, limit });
    return [];
  }
  return (data as Project[]) ?? [];
}
