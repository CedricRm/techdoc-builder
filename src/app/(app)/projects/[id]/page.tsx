// app/(app)/projects/[id]/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { exportPointsCsv } from "@/utils/exportCsv";
import { exportProjectPdf } from "@/utils/exportPdf";
import { createLogger } from "@/lib/logger";
import type {} from "@/features/projects/types";
import { useProjectDetail } from "@/features/projects/hooks/useProjectDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCards from "@/components/dashboard/StatsCards";
import { Layers3, ListChecks, PackageOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const log = createLogger("project.detail.page");

type FormState = { type: string; room: string; model: string; qty: number };
type Filters = { type: string; room: string; q: string };

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = params.id as string;
  const { project, equipments, points, add, remove } =
    useProjectDetail(projectId);
  const [form, setForm] = useState<FormState>({
    type: "HVAC",
    room: "",
    model: "",
    qty: 1,
  });
  const [filters, setFilters] = useState<Filters>({
    type: "",
    room: "",
    q: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onAddEquipment: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await add({
      type: form.type,
      room: form.room.trim(),
      model: form.model.trim(),
      qty: Number(form.qty) || 1,
    });
    if (error) {
      log.warn("addEquipment error", { message: error });
      setSubmitting(false);
      return;
    }
    setForm({ type: form.type, room: "", model: "", qty: 1 });
    setSubmitting(false);
  };

  const filteredEquipments = useMemo(() => {
    const tr = (s: string) => (s || "").toLowerCase();
    return equipments.filter(
      (e) =>
        (!filters.type || e.type === filters.type) &&
        (!filters.room || tr(e.room).includes(tr(filters.room))) &&
        (!filters.q ||
          tr([e.room, e.model, e.type].join(" ")).includes(tr(filters.q)))
    );
  }, [equipments, filters]);

  const stats = useMemo(() => {
    const totalEquip = equipments.length;
    const totalPoints = points.length;
    const byType = equipments.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
    return { totalEquip, totalPoints, byType };
  }, [equipments, points]);

  const onRemove = async (id: string) => {
    const { error } = await remove(id);
    if (error) {
      log.warn("removeEquipment error", { message: error, id });
    }
  };

  return (
    <div className="grid gap-6">
      {project && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {project.client || "—"} •
              {(project as unknown as { project_date?: string | null })
                .project_date ||
                project.date ||
                "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPointsCsv({ project, equipments, points })}
            >
              Exporter CSV
            </Button>
            <Button
              size="sm"
              onClick={() =>
                exportProjectPdf({ project, equipments, points, stats })
              }
            >
              Exporter PDF
            </Button>
          </div>
        </header>
      )}

      {/* KPI */}
      <StatsCards
        items={[
          {
            label: "Équipements",
            value: stats.totalEquip,
            icon: PackageOpen,
            accent:
              "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
          },
          {
            label: "Points",
            value: stats.totalPoints,
            icon: ListChecks,
            accent:
              "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
          },
          {
            label: "Types distincts",
            value: Object.keys(stats.byType).length,
            icon: Layers3,
            accent:
              "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
          },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Équipements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <Select
                value={filters.type}
                onValueChange={(v) =>
                  setFilters({ ...filters, type: v === "ALL" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous types</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="LIGHT">LIGHT</SelectItem>
                  <SelectItem value="SENSOR">SENSOR</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filtrer par room"
                value={filters.room}
                onChange={(e) =>
                  setFilters({ ...filters, room: e.target.value })
                }
              />
              <Input
                placeholder="Recherche"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="py-2">{e.type}</TableCell>
                    <TableCell>{e.room}</TableCell>
                    <TableCell>{e.model}</TableCell>
                    <TableCell>{e.qty}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(e.id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajouter un équipement</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={onAddEquipment}>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="LIGHT">LIGHT</SelectItem>
                  <SelectItem value="SENSOR">SENSOR</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Room"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
              <Input
                placeholder="Model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                value={String(form.qty)}
                onChange={(e) =>
                  setForm({ ...form, qty: Number(e.target.value) })
                }
              />
              <div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Ajout…" : "Ajouter"}
                </Button>
              </div>
            </form>

            <div className="mt-6 rounded-md bg-muted p-3 text-sm text-foreground/80">
              <p className="font-medium">Stats</p>
              <p>
                Équipements: {stats.totalEquip} • Points: {stats.totalPoints}
              </p>
              <ul className="mt-2 space-y-0.5">
                {Object.entries(stats.byType).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Points techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Key</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.map((pt) => {
                const e = equipments.find((x) => x.id === pt.equipment_id);
                return (
                  <TableRow key={pt.id}>
                    <TableCell className="py-2">
                      {e ? `${e.type} • ${e.room} • ${e.model}` : "—"}
                    </TableCell>
                    <TableCell>{pt.point_key}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
