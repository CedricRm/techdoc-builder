import Link from "next/link";
import { getRecentProjects } from "@/features/projects/services/projectService";
import type { Project } from "@/features/projects/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const projects = await getRecentProjects(5);

  // Optionnel: const { data: stats } = await supabase.rpc("dashboard_stats");
  // Astuce: créer une RPC; sinon calcule côté client dans /projects/[id]

  return (
    <div className="grid gap-4 lg:gap-6 xl:grid-cols-3">
      <section className="xl:col-span-2 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {projects?.length ? (
                projects.map((p: Project) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <Link className="underline" href={`/projects/${p.id}`}>
                      {p.name}
                    </Link>
                    <span className="text-muted-foreground">{p.client}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  Aucun projet pour le moment.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stats (exemple)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Total projets: {projects ? projects.length : 0}</p>
              {/* Placeholder chart */}
              <div className="mt-4 h-36 rounded-xl bg-accent" />
            </div>
          </CardContent>
        </Card>
      </section>
      <aside className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/projects">Nouveau projet</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
