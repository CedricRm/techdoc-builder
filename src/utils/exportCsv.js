import { formatDateFR } from "@/utils/date";

export function exportPointsCsv({ project, equipments, points }) {
  const header = [
    "project",
    "client",
    "date",
    "equipment_type",
    "room",
    "model",
    "qty",
    "point_key",
  ];
  const eqMap = Object.fromEntries(equipments.map((e) => [e.id, e]));
  const rows = points.map((pt) => {
    const e = eqMap[pt.equipment_id] || {};
    return [
      project.name,
      project.client,
      formatDateFR(project.project_date),
      e.type || "",
      e.room || "",
      e.model || "",
      e.qty || 1,
  pt.point_key ?? pt.key,
    ];
  });
  const csv = [header, ...rows]
    .map((r) => r.map(escapeCsv).join(","))
    .join("\n");
  downloadFile(
    csv,
    `techdoc_points_${project.name}.csv`,
    "text/csv;charset=utf-8"
  );
}

function escapeCsv(v) {
  const s = (v ?? "").toString();
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
