"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createLogger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
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
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function Topbar() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const log = createLogger("topbar");
  const { theme, setTheme } = useTheme();
  const { initials, displayName, firstName } = useCurrentUser();

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
        {/* Site title (left) */}
        <Link href="/dashboard" className="font-semibold tracking-tight">
          TechDoc‑Builder
        </Link>

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
