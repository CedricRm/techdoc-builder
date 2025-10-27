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
