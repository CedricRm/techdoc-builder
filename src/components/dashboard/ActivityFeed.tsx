"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilePlus2, FolderKanban, Pencil, User } from "lucide-react";

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

export default function ActivityFeed({ items = [] as ActivityItem[] }) {
  const data: ActivityItem[] =
    items.length > 0
      ? items
      : [
          {
            id: "1",
            type: "project",
            title: "Nouveau projet créé",
            description: "Projet Alpha pour client Nova",
            at: "Aujourd'hui, 09:20",
            by: "Cédric",
          },
          {
            id: "2",
            type: "document",
            title: "Document généré",
            description: "Spécifications techniques v1.2",
            at: "Hier, 17:05",
            by: "Amira",
          },
          {
            id: "3",
            type: "edit",
            title: "Modification d'équipement",
            description: "Mise à jour du modèle caméra",
            at: "Hier, 10:14",
            by: "Léa",
          },
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
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
        <Separator className="my-4" />
        <p className="text-xs text-muted-foreground">
          Flux d&rsquo;activité interne. Connectez à vos événements réels
          (Supabase Realtime, logs, etc.).
        </p>
      </CardContent>
    </Card>
  );
}
