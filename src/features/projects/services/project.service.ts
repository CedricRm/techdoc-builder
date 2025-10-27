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

/**
 * Count projects created within the last N days.
 * Default 7 days.
 */
export async function countProjectsSince(days: number = 7): Promise<number> {
  const supabase = supabaseBrowser();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const iso = fromDate.toISOString();

  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .gte("created_at", iso);

  if (error) {
    log.error("countProjectsSince failed", { message: error.message, days });
    return 0;
  }
  return count ?? 0;
}

/**
 * Return a time series of number of projects created per day
 * over the given window (length days). Suitable for sparklines.
 */
export async function getProjectsCreatedTimeseries(
  length: number
): Promise<{ x: number; y: number; date: string }[]> {
  const supabase = supabaseBrowser();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - (length - 1));
  const iso = fromDate.toISOString();

  // Fetch only created_at in window
  const { data, error } = await supabase
    .from("projects")
    .select("created_at")
    .gte("created_at", iso)
    .order("created_at", { ascending: true });

  if (error) {
    log.error("getProjectsCreatedTimeseries failed", {
      message: error.message,
      length,
    });
    return [];
  }

  const dates =
    (data as Array<{ created_at: string }>)?.map((d) => d.created_at) ?? [];

  // Bucket per day
  const counts = new Map<string, number>();
  for (const dt of dates) {
    const day = new Date(dt);
    // normalize to YYYY-MM-DD
    const key = day.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Build contiguous series from fromDate to today
  const series: { x: number; y: number; date: string }[] = [];
  const cur = new Date(fromDate);
  for (let i = 0; i < length; i++) {
    const key = cur.toISOString().slice(0, 10);
    series.push({ x: i, y: counts.get(key) ?? 0, date: key });
    cur.setDate(cur.getDate() + 1);
  }
  return series;
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
