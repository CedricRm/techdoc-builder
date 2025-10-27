"use client";

import { useEffect, useState } from "react";
import { getProjectsCreatedTimeseries } from "@/features/projects/services/project.service";
import { createLogger } from "@/lib/logger";

const log = createLogger("useProjectsTrends");

export type TrendPoint = { x: number; y: number; date: string };

export function useProjectsTrends(range: "7d" | "30d") {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const length = range === "7d" ? 7 : 30;
        const res = await getProjectsCreatedTimeseries(length);
        if (!alive) return;
        setData(res);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur inconnue";
        log.error("load trends failed", { message });
        if (alive) setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [range]);

  return { data, loading, error };
}

export default useProjectsTrends;
