"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilePlus2, FolderKanban, Pencil, User } from "lucide-react";
import { useActivityFeed } from "@/features/activity/hooks/useActivityFeed";

type ActivityItem = {
  id: string;
  type: "project" | "document" | "edit" | "user";
  title: string;
  description?: string;
  at: string; // human date
  by?: string;
};

const icons: Record<ActivityItem["type"], React.ElementType> = {
  project: FolderKanban,
  document: FilePlus2,
  edit: Pencil,
  user: User,
};

export default function ActivityFeed({
  items = [] as ActivityItem[],
  projectId,
}: {
  items?: ActivityItem[];
  projectId?: string;
}) {
  const live = useActivityFeed(projectId);
  const data: ActivityItem[] = items.length > 0 ? items : live;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activités récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune activité récente.
          </p>
        ) : (
          <ul className="space-y-4">
            {data.map((a) => {
              const Icon = icons[a.type as ActivityItem["type"]];
              const initial = (a.by ?? "?").slice(0, 1).toUpperCase();
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="mt-1 rounded-md bg-foreground/10 p-2 text-foreground dark:bg-foreground/20">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{a.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {a.at}
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-sm text-muted-foreground">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <Avatar className="size-6">
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
