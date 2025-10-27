"use client";

import { supabaseBrowser } from "@/lib/supabaseClient.browser";
import { createLogger } from "@/lib/logger";
import type { Point, Equipment } from "../types";
import { POINT_RULES } from "../../../lib/rules";
import { POINT_META } from "../../../lib/pointMeta";

const log = createLogger("points.service");

export async function listPoints(projectId: string): Promise<Point[]> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("points")
    .select("id,project_id,equipment_id,point_key")
    .eq("project_id", projectId);
  if (error) {
    log.error("listPoints failed", { message: error.message, projectId });
    return [];
  }
  return (data as Point[]) ?? [];
}

/**
 * Count all technical points across projects
 */
export async function countAllPoints(): Promise<number> {
  const supabase = supabaseBrowser();
  const { count, error } = await supabase
    .from("points")
    .select("*", { count: "exact", head: true });
  if (error) {
    log.error("countAllPoints failed", { message: error.message });
    return 0;
  }
  return count ?? 0;
}

/**
 * Generate points for a given equipment using app-side rules and metadata,
 * then insert all missing points into Supabase.
 */
export async function generatePointsForEquipment(
  equipment: Pick<
    Equipment,
    "id" | "project_id" | "type" | "room" | "model" | "qty"
  >,
  projectCode: string
) {
  const rule = POINT_RULES[equipment.type];
  if (!rule || rule.length === 0) return [] as Point[];

  const supabase = supabaseBrowser();

  // Avoid duplicates: gather existing keys for this equipment
  const { data: existing = [] } = await supabase
    .from("points")
    .select("point_key")
    .eq("equipment_id", equipment.id);
  const have = new Set(
    (existing as Array<{ point_key: string }>).map((x) => x.point_key)
  );

  const pointsToInsert: Array<Record<string, unknown>> = [];

  for (let i = 1; i <= (Number(equipment.qty) || 1); i++) {
    for (const key of rule) {
      if (have.has(key)) continue;
      const meta = POINT_META[key] ?? {};
      const idx = String(i).padStart(2, "0");
      const tag = `${projectCode}.${equipment.room}.${equipment.type}.${equipment.model}.${idx}.${key}`;
      pointsToInsert.push({
        project_id: equipment.project_id,
        equipment_id: equipment.id,
        tag,
        idx: i,
        point_key: key,
        rw: meta.rw ?? null,
        io: meta.io ?? null,
        unit: meta.unit ?? null,
        description: meta.desc ?? null,
      });
    }
  }

  if (pointsToInsert.length === 0) return [] as Point[];

  const { data, error } = await supabase
    .from("points")
    .insert(pointsToInsert)
    .select("*");
  if (error) {
    log.error("generatePointsForEquipment insert failed", {
      message: error.message,
    });
    throw error;
  }
  return data as Point[];
}
