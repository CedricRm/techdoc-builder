"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project, Equipment, Point } from "../types";
import { getProjectById } from "../services/project.service";
import {
  listEquipments,
  addEquipment,
  removeEquipment,
  type AddEquipmentInput,
} from "../services/equipments.service";
import {
  listPoints,
  generatePointsForEquipment,
} from "../services/point.service";
import { createLogger } from "@/lib/logger";

const log = createLogger("useProjectDetail");

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [p, eq, pt] = await Promise.all([
      getProjectById(projectId),
      listEquipments(projectId),
      listPoints(projectId),
    ]);
    setProject(p);
    setEquipments(eq);
    setPoints(pt);
    setLoading(false);
  }, [projectId]);

  const add = useCallback(
    async (input: Omit<AddEquipmentInput, "projectId">) => {
      setLoading(true);
      const { id, type, error } = await addEquipment({
        ...input,
        projectId,
      });
      if (error || !id || !type) {
        log.warn("addEquipment error", { message: error });
        setLoading(false);
        return { error: error ?? "Unknown error" } as const;
      }
      try {
        await generatePointsForEquipment(
          {
            id,
            project_id: projectId,
            type,
            room: input.room,
            model: input.model,
            qty: input.qty,
          },
          (typeof window !== "undefined" && (project?.name || projectId)) ||
            projectId
        );
      } catch (e) {
        log.error("generatePointsForEquipment failed", {
          message: (e as Error)?.message,
        });
      }
      await refresh();
      setLoading(false);
      return {} as const;
    },
    [projectId, refresh, project]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      const res = await removeEquipment(id);
      await refresh();
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

  return { project, equipments, points, loading, refresh, add, remove };
}

export type UseProjectDetail = ReturnType<typeof useProjectDetail>;
