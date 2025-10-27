"use client";

import { useEffect, useState } from "react";
import {
  listActivities,
  subscribeActivities,
  RawActivity,
} from "@/features/activity/service/activity.service";

export type ActivityItem = {
  id: string;
  type: "project" | "document" | "edit" | "user";
  title: string;
  description?: string;
  at: string; // human date
  by?: string;
};

function toItem(row: RawActivity): ActivityItem {
  const date = row.created_at ? new Date(row.created_at) : null;
  const at = date
    ? date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
    : "";
  const type = (row.type ?? "edit") as ActivityItem["type"];
  return {
    id: String(row.id),
    type: ["project", "document", "edit", "user"].includes(String(type))
      ? (type as ActivityItem["type"])
      : "edit",
    title: (row.title as string) ?? "Activité",
    description: (row.description as string) ?? undefined,
    at,
    by: (row.by as string) ?? undefined,
  };
}

export function useActivityFeed(projectId?: string) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rows = await listActivities({ projectId, limit: 20 });
      if (!alive) return;
      setItems(rows.map(toItem));
    })();

    const unsubscribe = subscribeActivities(projectId, (row) => {
      setItems((curr) => [toItem(row), ...curr].slice(0, 20));
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [projectId]);

  return items;
}
