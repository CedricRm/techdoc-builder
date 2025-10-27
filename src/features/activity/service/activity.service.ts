"use client";

import { supabaseBrowser } from "@/lib/supabaseClient.browser";
import { createLogger } from "@/lib/logger";

export type RawActivity = Record<string, unknown> & {
  id: string;
  project_id?: string | null;
  type?: string | null;
  title?: string | null;
  description?: string | null;
  created_at?: string;
  by?: string | null;
};

const log = createLogger("activity.service");

export async function listActivities(params?: {
  projectId?: string;
  limit?: number;
}) {
  const supabase = supabaseBrowser();
  const limit = params?.limit ?? 20;
  let q = supabase.from("activities").select("*").order("created_at", {
    ascending: false,
  });
  if (params?.projectId) q = q.eq("project_id", params.projectId);
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) {
    log.error("listActivities failed", { message: error.message });
    return [] as RawActivity[];
  }
  return (data as RawActivity[]) ?? [];
}

export function subscribeActivities(
  projectId: string | undefined,
  onInsert: (row: RawActivity) => void
) {
  const supabase = supabaseBrowser();
  const channel = supabase
    .channel(`activities:${projectId ?? "all"}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "activities",
        ...(projectId ? { filter: `project_id=eq.${projectId}` } : {}),
      },
      (payload) => onInsert(payload.new as RawActivity)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
