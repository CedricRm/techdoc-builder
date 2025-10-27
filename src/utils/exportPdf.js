import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateFR } from "@/utils/date";

export function exportProjectPdf({ project, equipments, points, stats }) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Fiche projet — ${project.name}`, 14, 16);
  doc.setFontSize(10);
  doc.text(`Client: ${project.client}`, 14, 24);
  const formattedDate = formatDateFR(project.project_date);
  doc.text(`Date: ${formattedDate || "—"}`, 14, 30);

  // Tableau points
  const eqMap = Object.fromEntries(equipments.map((e) => [e.id, e]));
  const body = points.map((pt) => {
    const e = eqMap[pt.equipment_id] || {};
    const key = pt.point_key ?? pt.key;
    return [e.type || "", e.room || "", e.model || "", e.qty || 1, key];
  });
  autoTable(doc, {
    startY: 38,
    head: [["Type", "Room", "Model", "Qty", "Point"]],
    body,
  });

  // Résumé
  let y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 40;
  doc.setFontSize(12);
  doc.text("Résumé", 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(`Équipements: ${stats.totalEquip}`, 14, y);
  y += 5;
  doc.text(`Points: ${stats.totalPoints}`, 14, y);
  y += 5;
  Object.entries(stats.byType).forEach(([k, v]) => {
    doc.text(`${k}: ${v}`, 14, y);
    y += 5;
  });

  doc.save(`fiche_${project.name}.pdf`);
}
