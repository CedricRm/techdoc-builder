"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser } from "@/features/auth/services/authService";
import { createLogger } from "@/lib/logger";

const log = createLogger("useCurrentUser");

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { user, error } = await getCurrentUser();
      if (error) {
        setError(error.message);
        log.warn("getCurrentUser failed", { message: error.message });
      } else {
        setError(null);
      }
      setUser(user);
    } catch (e) {
      const msg = (e as Error)?.message ?? "Unknown error";
      setError(msg);
      log.error("getCurrentUser threw", { message: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const displayName = useMemo(() => {
    const meta = (user?.user_metadata as Record<string, unknown>) || {};
    return (
      (meta["full_name"] as string) ||
      (meta["name"] as string) ||
      (meta["username"] as string) ||
      user?.email ||
      ""
    );
  }, [user]);

  const initials = useMemo(() => {
    const cleaned = (displayName || "").trim();
    if (!cleaned) return "U";
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    const letter = cleaned.replace(/^([^a-zA-Z]*)([a-zA-Z]).*$/, "$2");
    return (letter || cleaned[0] || "U").toUpperCase();
  }, [displayName]);

  const firstName = useMemo(() => {
    const raw = (displayName || "").trim();
    if (!raw) return "";
    const cap = (s: string) =>
      s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    // If it's an email, derive from local part before @
    if (raw.includes("@")) {
      const local = raw.split("@")[0] || "";
      const part = (local.split(/[._-]/)[0] || local).trim();
      return cap(part);
    }
    // Otherwise, take the first token
    const first = raw.split(/\s+/)[0] || raw;
    return cap(first);
  }, [displayName]);

  return {
    user,
    loading,
    error,
    displayName,
    firstName,
    initials,
    refresh,
  } as const;
}

export type UseCurrentUser = ReturnType<typeof useCurrentUser>;
