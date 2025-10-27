"use client";

import Link from "next/link";
import { useRecentProjects } from "@/features/projects/hooks/useRecentProjects";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsTable({ limit = 8 }: { limit?: number }) {
  const { items, loading } = useRecentProjects(limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projets récents</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableCaption>
              Derniers projets créés et leurs clients.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Aucun projet pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/projects/${p.id}`} className="underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.client ?? "—"}</TableCell>
                    <TableCell>
                      {(p as unknown as { project_date?: string | null })
                        .project_date ??
                        p.date ??
                        "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">Actif</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
