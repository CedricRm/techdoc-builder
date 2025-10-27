export const RULES = {
  HVAC: ["cmdOnOff", "setpointTemp", "actualTemp", "alarm"],
  LIGHT: ["cmdOnOff", "dimming", "alarm"],
  SENSOR: ["measure", "alarm"],
};

export async function generatePointsForEquipment({
  supabase,
  projectId,
  equipmentId,
  keys,
}) {
  if (!keys?.length) return [];
  // éviter doublons: on regarde ce qui existe déjà
  const { data: existing = [] } = await supabase
    .from("points")
    .select("key")
    .eq("equipment_id", equipmentId);
  const have = new Set(existing.map((x) => x.key));
  const toInsert = keys
    .filter((k) => !have.has(k))
    .map((k) => ({ project_id: projectId, equipment_id: equipmentId, key: k }));
  if (!toInsert.length) return [];
  const { data, error } = await supabase
    .from("points")
    .insert(toInsert)
    .select("*");
  if (error) throw error;
  return data;
}
