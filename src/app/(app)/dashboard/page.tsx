"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/dashboard/StatsCards";
import TrendsChart from "@/components/dashboard/TrendsChart";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { FolderKanban, FileText, TrendingUp, Database } from "lucide-react";

export default function DashboardPage() {
  const { items: allProjects } = useProjects();

  // Optionnel: const { data: stats } = await supabase.rpc("dashboard_stats");
  // Astuce: créer une RPC; sinon calcule côté client dans /projects/[id]

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/projects">Nouveau projet</Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <StatsCards
        items={[
          {
            label: "Total projets",
            value: allProjects.length,
            icon: FolderKanban,
            accent:
              "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
          },
          {
            label: "Documents",
            value: 0,
            delta: "+0%",
            icon: FileText,
            accent:
              "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
          },
          {
            label: "Avancement moyen",
            value: "—",
            delta: "+0%",
            icon: TrendingUp,
            accent:
              "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
          },
          {
            label: "Stockage",
            value: "4.2 / 10 GB",
            icon: Database,
            accent:
              "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
          },
        ]}
      />

      {/* Charts + Activity */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendsChart />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Projects and quick actions */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectsTable limit={8} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
