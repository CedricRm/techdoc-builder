// app/(app)/projects/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
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
import { createLogger } from "@/lib/logger";
import { useProjects } from "@/features/projects/hooks/useProjects";

const log = createLogger("projects.page");

type FormState = { name: string; client: string; date: string };

export default function ProjectsPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    client: "",
    date: "",
  });

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
    } else {
      setForm({ name: "", client: "", date: "" });
    }
  };

  const onRemove = async (id: string) => {
    const { error } = await remove(id);
    if (error) {
      log.warn("deleteProject error", { message: error, id });
    } else {
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer un projet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Client"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="sm:col-span-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Création…" : "Créer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes projets</CardTitle>
        </CardHeader>
        <CardContent>
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
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.client}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.date}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/projects/${p.id}`}>Ouvrir</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(p.id)}
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
    </div>
  );
}
