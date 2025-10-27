"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, FileText, TrendingUp, Database } from "lucide-react";

type StatItem = {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
  accent?: string; // Tailwind color class
};

export function StatsCards({
  items = [
    {
      label: "Total projets",
      value: 0,
      delta: "+0.0%",
      icon: FolderKanban,
      accent:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    {
      label: "Documents",
      value: 0,
      delta: "+0.0%",
      icon: FileText,
      accent:
        "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    },
    {
      label: "Taux d'avancement",
      value: "—",
      delta: "+0.0%",
      icon: TrendingUp,
      accent:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
    {
      label: "Stockage",
      value: "4.2 / 10 GB",
      icon: Database,
      accent: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    },
  ] as StatItem[],
}: {
  items?: StatItem[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, delta, icon: Icon, accent }, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div
              className={`rounded-md p-2 ${
                accent ?? "bg-accent text-accent-foreground"
              }`}
            >
              <Icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {delta && (
              <p className="mt-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="mr-1 align-middle">
                  {delta}
                </Badge>
                vs semaine dernière
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StatsCards;
