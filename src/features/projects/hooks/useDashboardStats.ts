"use client";

import { useEffect, useState } from "react";
import {
  countAllEquipments,
  groupEquipmentsByType,
  EquipmentsByType,
} from "@/features/projects/services/equipments.service";
import { countAllPoints } from "@/features/projects/services/point.service";
import { createLogger } from "@/lib/logger";

const log = createLogger("useDashboardStats");

export type DashboardStats = {
  totalEquip: number;
  totalPoints: number;
  byType: EquipmentsByType;
};

const INITIAL: DashboardStats = { totalEquip: 0, totalPoints: 0, byType: {} };

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [totalEquip, totalPoints, byType] = await Promise.all([
          countAllEquipments(),
          countAllPoints(),
          groupEquipmentsByType(),
        ]);
        if (!alive) return;
        setStats({ totalEquip, totalPoints, byType });
      } catch (e) {
        if (!alive) return;
        const message = e instanceof Error ? e.message : "Erreur inconnue";
        log.error("load stats failed", { message });
        setError(message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { stats, loading, error };
}

export default useDashboardStats;
