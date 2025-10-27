"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLogger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOutUser } from "@/features/auth/services/authService";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell, Moon, Sun, Search, FolderKanban } from "lucide-react";
import { useTheme } from "next-themes";
import { useProjects } from "@/features/projects/hooks/useProjects";
// Sidebar is rendered in layout; not needed here

export default function Topbar() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const log = createLogger("topbar");
  const { theme, setTheme } = useTheme();
  const { initials, displayName, firstName } = useCurrentUser();
  const [q, setQ] = useState("");
  const { items: projects } = useProjects();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projets" },
    { href: "/projects?create=1", label: "Nouveau projet" },
  ];
  const qn = q.trim().toLowerCase();
  const projectMatches = qn
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(qn) ||
          (p.client ?? "").toLowerCase().includes(qn)
      )
    : [];
  const linkMatches = links.filter((l) =>
    qn ? l.label.toLowerCase().includes(qn) : true
  );
  const results = (
    [
      ...projectMatches.map((p) => ({
        href: `/projects/${p.id}`,
        label: p.name,
        sub: p.client ?? undefined,
        kind: "project" as const,
      })),
      ...linkMatches.map((l) => ({ ...l, kind: "link" as const })),
    ] as Array<{
      href: string;
      label: string;
      sub?: string;
      kind: "project" | "link";
    }>
  ).slice(0, 8);

  const onSignOut = async () => {
    try {
      const { error } = await signOutUser();
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
      <div className="flex w-full min-w-0 items-center gap-3 p-3 lg:p-4">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          TechDoc‑Builder
        </Link>

        {/* Search in topbar (center) */}
        <div className="hidden md:block flex-1 max-w-md mx-2">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (Ctrl/⌘+K)"
              aria-label="Rechercher"
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const target = results[0];
                  if (target) router.push(target.href);
                }
              }}
            />
            {q && (
              <div className="absolute left-0 right-0 mt-2 rounded-md border bg-popover text-popover-foreground shadow">
                {results.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Aucun résultat.
                  </div>
                ) : (
                  <ul className="py-1">
                    {results.map((it) => (
                      <li key={`${it.kind}-${it.href}`}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => router.push(it.href)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                        >
                          {it.kind === "project" ? (
                            <FolderKanban className="size-4" />
                          ) : (
                            <Search className="size-4" />
                          )}
                          <span className="truncate">{it.label}</span>
                          {it.sub && (
                            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">
                              {it.sub}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right-only actions: theme + notification + account */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Basculer le thème"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <TooltipProvider disableHoverableContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Avatar className="size-6">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span
                  className="hidden sm:inline max-w-40 md:max-w-56 truncate text-left"
                  title={displayName || undefined}
                >
                  {firstName || "Compte"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSignOut} disabled={pending}>
                {pending ? "Déconnexion…" : "Se déconnecter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
