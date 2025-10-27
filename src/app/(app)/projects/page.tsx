// app/(app)/projects/page.tsx
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDateFR } from "@/utils/date";
import { createLogger } from "@/lib/logger";
import { useProjects } from "@/features/projects/hooks/useProjects";

const log = createLogger("projects.page");

type FormState = { name: string; client: string; date: string };
type SortKey =
  | "created_desc"
  | "name_asc"
  | "name_desc"
  | "date_desc"
  | "date_asc";

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Create dialog form state
  const [form, setForm] = useState<FormState>({
    name: "",
    client: "",
    date: "",
  });
  const [createOpen, setCreateOpen] = useState(
    () => searchParams.get("create") === "1"
  );
  // keep other states below

  // Delete confirmation dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // List UX state
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_desc");
  const [visible, setVisible] = useState(10);

  const { items, loading, create, remove } = useProjects();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const { error } = await create({
      name: form.name.trim(),
      client: form.client.trim(),
      project_date: form.date || null,
    });
    if (error) {
      log.warn("createProject error", { message: error });
      toast.error("Échec de la création du projet", { description: error });
    } else {
      toast.success("Projet créé");
      setForm({ name: "", client: "", date: "" });
      setCreateOpen(false);
    }
  };

  const askRemove = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteOpen(true);
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    const { error } = await remove(deleteTarget.id);
    if (error) {
      log.warn("deleteProject error", { message: error, id: deleteTarget.id });
      toast.error("Échec de la suppression", { description: error });
    } else {
      toast.success("Projet supprimé");
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const filtered = useMemo(() => {
    const tr = (s: string) => (s || "").toLowerCase();
    let res = !q
      ? items
      : items.filter(
          (p) =>
            tr(p.name).includes(tr(q)) || tr(p.client || "").includes(tr(q))
        );

    // sort
    const getDate = (p: unknown) =>
      (p as unknown as { project_date?: string | null }).project_date ||
      (p as unknown as { date?: string | null }).date ||
      null;

    res = [...res].sort((a, b) => {
      switch (sortKey) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_asc": {
          const da = getDate(a);
          const db = getDate(b);
          return (
            (da ? new Date(da).getTime() : 0) -
            (db ? new Date(db).getTime() : 0)
          );
        }
        case "date_desc": {
          const da = getDate(a);
          const db = getDate(b);
          return (
            (db ? new Date(db).getTime() : 0) -
            (da ? new Date(da).getTime() : 0)
          );
        }
        case "created_desc":
        default:
          // server already returns created_at desc; keep stable
          return 0;
      }
    });
    return res;
  }, [items, q, sortKey]);

  const paged = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
  const isInitialLoading = loading && items.length === 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:gap-8 w-full px-3 lg:px-4">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Projets
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Total:</span>
          <span className="font-medium text-foreground">{items.length}</span>
        </div>
      </div>

      {/* Create project dialog trigger */}
      <div className="flex justify-end">
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            // keep URL in sync
            const sp = new URLSearchParams(window.location.search);
            if (open) sp.set("create", "1");
            else sp.delete("create");
            const qs = sp.toString();
            router.replace(`/projects${qs ? `?${qs}` : ""}`);
          }}
        >
          <DialogTrigger asChild>
            <Button>Nouveau projet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau projet</DialogTitle>
              <DialogDescription>
                Renseignez les informations ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <form
              id="create-project"
              onSubmit={onSubmit}
              className="grid gap-3"
            >
              <Input
                placeholder="Nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                placeholder="Client"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="project-date"
                >
                  Date du projet
                </label>
                <Input
                  id="project-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </form>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                type="button"
              >
                Annuler
              </Button>
              <Button form="create-project" type="submit" disabled={loading}>
                {loading ? "Création…" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="shrink-0">Mes projets</CardTitle>
          <div
            className="ml-auto flex items-center gap-2"
            data-slot="card-action"
          >
            <div className="hidden sm:block text-sm text-muted-foreground">
              Tri
            </div>
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger size="sm" className="min-w-[180px] md:min-w-56">
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="created_desc">
                  Récents d&apos;abord
                </SelectItem>
                <SelectItem value="name_asc">Nom A → Z</SelectItem>
                <SelectItem value="name_desc">Nom Z → A</SelectItem>
                <SelectItem value="date_desc">Date la plus récente</SelectItem>
                <SelectItem value="date_asc">Date la plus ancienne</SelectItem>
              </SelectContent>
            </Select>
            <div className="min-w-0 max-w-full w-full sm:w-64 md:w-80 lg:w-96">
              <Input
                placeholder="Rechercher par nom ou client…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isInitialLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-[140px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      {loading ? "Chargement…" : "Aucun projet trouvé."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/projects/${p.id}`)
                      }
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.client || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {(() => {
                          const d =
                            (p as unknown as { project_date?: string | null })
                              .project_date ||
                            (p as unknown as { date?: string | null }).date ||
                            null;
                          return d ? formatDateFR(d) : "—";
                        })()}
                      </TableCell>
                      <TableCell
                        className="text-right space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${p.id}`}>Ouvrir</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => askRemove(p.id, p.name)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {filtered.length > paged.length && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisible((v) => v + 10)}
                disabled={loading}
              >
                Afficher plus
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le projet</DialogTitle>
            <DialogDescription>
              {deleteTarget ? (
                <>
                  Voulez-vous vraiment supprimer «
                  <span className="font-medium text-foreground">
                    {deleteTarget.name}
                  </span>
                  » ? Cette action est irréversible.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              type="button"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={loading}
            >
              {loading ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
