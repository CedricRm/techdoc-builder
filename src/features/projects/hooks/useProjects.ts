"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "../types";
import {
  listProjects as listProjectsSvc,
  createProject as createProjectSvc,
  deleteProject as deleteProjectSvc,
  type CreateProjectInput,
} from "../services/project.service";

export function useProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listProjectsSvc();
    setItems(data);
    setLoading(false);
  }, []);

  const create = useCallback(
    async (input: CreateProjectInput) => {
      setLoading(true);
      const res = await createProjectSvc(input);
      if (!res.error) {
        await refresh();
      }
      setLoading(false);
      return res;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      const res = await deleteProjectSvc(id);
      if (!res.error) {
        await refresh();
      }
      setLoading(false);
      return res;
    },
    [refresh]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  return { items, loading, refresh, create, remove };
}

export type UseProjects = ReturnType<typeof useProjects>;
