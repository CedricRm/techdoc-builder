"use client";

import { supabaseBrowser } from "@/lib/supabaseClient.browser";
import { createLogger } from "@/lib/logger";
import type { Equipment } from "../types";

const log = createLogger("equipments.service");

export async function listEquipments(projectId: string): Promise<Equipment[]> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("equipments")
    .select("id,project_id,type,room,model,qty,created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) {
    log.error("listEquipments failed", { message: error.message, projectId });
    return [];
  }
  return (data as Equipment[]) ?? [];
}

// Points methods moved to point.service.ts

/**
 * Count all equipments across projects
 */
export async function countAllEquipments(): Promise<number> {
  const supabase = supabaseBrowser();
  const { count, error } = await supabase
    .from("equipments")
    .select("*", { count: "exact", head: true });
  if (error) {
    log.error("countAllEquipments failed", { message: error.message });
    return 0;
  }
  return count ?? 0;
}

export type EquipmentsByType = Record<string, number>;

/**
 * Aggregate equipments count by type
 */
export async function groupEquipmentsByType(): Promise<EquipmentsByType> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("equipments")
    // Fetch only the "type" column to reduce payload, we'll aggregate client-side
    .select("type");
  if (error) {
    log.error("groupEquipmentsByType failed", { message: error.message });
    return {};
  }
  const rows = (data as Array<{ type: string | null }>) ?? [];
  const result: EquipmentsByType = {};
  for (const r of rows) {
    const key = r.type ?? "Inconnu";
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

export type AddEquipmentInput = {
  projectId: string;
  type: string;
  room: string;
  model: string;
  qty: number;
};

export async function addEquipment(
  input: AddEquipmentInput
): Promise<{ id?: string; type?: string; error?: string }> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("equipments")
    .insert([
      {
        project_id: input.projectId,
        type: input.type,
        room: input.room,
        model: input.model,
        qty: input.qty,
      },
    ])
    .select("id,type");
  if (error) {
    log.error("addEquipment failed", { message: error.message });
    return { error: error.message };
  }
  const eq = (data as Array<{ id: string; type: string }>)[0];
  return { id: eq?.id, type: eq?.type };
}

export async function removeEquipment(id: string): Promise<{ error?: string }> {
  const supabase = supabaseBrowser();
  const { error } = await supabase.from("equipments").delete().eq("id", id);
  if (error) {
    log.error("removeEquipment failed", { message: error.message, id });
    return { error: error.message };
  }
  return {};
}
