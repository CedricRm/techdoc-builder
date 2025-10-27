// components/dashboard/Topbar.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient.browser";
import { createLogger } from "@/lib/logger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const log = createLogger("topbar");

  const onSignOut = async () => {
    const supabase = supabaseBrowser();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        log.warn("signOut failed", { message: error.message });
      } else {
        log.info("signOut success");
      }
    } catch (e) {
      log.error("signOut threw", { message: (e as Error)?.message });
    } finally {
      startTransition(() => router.replace("/login"));
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full min-w-0 items-center gap-3 p-3 lg:p-4">
        {/* Breadcrumb simple */}
        <div className="hidden text-sm text-muted-foreground lg:block">
          Accueil / Dashboard
        </div>

        {/* Search */}
        <div className="ml-auto flex-1 min-w-0 lg:ml-0 lg:flex-none">
          <label className="relative block">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="pr-10"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
              ⌘K
            </span>
          </label>
        </div>

        {/* User menu (simplifié) */}
        <Button
          onClick={onSignOut}
          disabled={pending}
          variant="outline"
          size="sm"
        >
          {pending ? "Déconnexion…" : "Se déconnecter"}
        </Button>
      </div>
    </header>
  );
}
