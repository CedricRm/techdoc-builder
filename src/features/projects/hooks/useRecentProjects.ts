"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "../types";
import { getRecentProjects as getRecentProjectsSvc } from "../services/project.service";

export function useRecentProjects(limit = 5) {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getRecentProjectsSvc(limit);
    setItems(data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  return { items, loading, refresh };
}

export type UseRecentProjects = ReturnType<typeof useRecentProjects>;
