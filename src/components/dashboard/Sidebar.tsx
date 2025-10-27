"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  LayoutGrid,
  FolderKanban,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/projects", label: "Projets", icon: FolderKanban },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focusIdx, setFocusIdx] = useState(0);

  // Read persisted state after mount to avoid SSR/CSR mismatch during hydration
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setCollapsed(localStorage.getItem("sidebar:collapsed") === "1");
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // Keyboard: Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const mod = e.ctrlKey || e.metaKey;
      if (isK && mod) {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => {
          try {
            const el = document.getElementById(
              "sidebar-search-input"
            ) as HTMLInputElement | null;
            el?.focus();
          } catch {}
        }, 0);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const actions = [
    ...links,
    { href: "/projects?create=1", label: "Nouveau projet", icon: FolderKanban },
  ];
  const filtered = actions.filter((a) =>
    q.trim() ? a.label.toLowerCase().includes(q.toLowerCase()) : true
  );

  const go = (href: string) => {
    setSearchOpen(false);
    setQ("");
    router.push(href);
  };

  // Expose current sidebar width as a CSS variable for layout padding sync
  useEffect(() => {
    const width = collapsed ? "72px" : "280px";
    try {
      document.documentElement.style.setProperty("--sidebar-width", width);
    } catch {}
  }, [collapsed]);

  const NavLink = ({
    href,
    label,
    Icon,
    isCollapsed = false,
  }: {
    href: string;
    label: string;
    Icon: React.ElementType;
    isCollapsed?: boolean;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        aria-label={isCollapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        data-active={active ? "true" : "false"}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          isCollapsed && "justify-center",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile: Sheet drawer using shadcn/ui */}
      <div className="p-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Ouvrir le menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="p-4">
              <SheetTitle>
                <Link href="/dashboard">TechDoc‑Builder</Link>
              </SheetTitle>
            </SheetHeader>
            <Separator />
            <nav className="p-2">
              {links.map(({ href, label, icon: Icon }) => (
                <SheetClose asChild key={href}>
                  <NavLink href={href} label={label} Icon={Icon} />
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: static sidebar */}
      <aside
        className={cn(
          "hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:bg-background lg:shadow-none lg:overflow-y-auto transition-[width] duration-200",
          collapsed ? "lg:w-[72px]" : "lg:w-[280px]"
        )}
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col gap-4 p-4">
          <div
            className={cn(
              "mb-2 px-2 text-sm font-semibold flex items-center",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {/* {!collapsed && <Link href="/dashboard">TechDoc‑Builder</Link>} */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                collapsed
                  ? "Déplier la barre latérale"
                  : "Replier la barre latérale"
              }
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </Button>
          </div>

          {/* Inline search moved to Topbar. Use Ctrl/Cmd+K for command palette. */}
          <TooltipProvider disableHoverableContent>
            <nav className="space-y-1">
              {links.map(({ href, label, icon: Icon }) =>
                collapsed ? (
                  <Tooltip delayDuration={250} key={href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        href={href}
                        label={label}
                        Icon={Icon}
                        isCollapsed
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink key={href} href={href} label={label} Icon={Icon} />
                )
              )}
            </nav>
          </TooltipProvider>
        </div>
      </aside>

      {/* Command Palette / Search */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle>Rechercher (Ctrl/⌘+K)</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <Input
              id="sidebar-search-input"
              placeholder="Tapez pour rechercher…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setFocusIdx(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setFocusIdx((i) => Math.min(i + 1, filtered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setFocusIdx((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  const target = filtered[focusIdx];
                  if (target) go(target.href);
                }
              }}
            />
            <div className="mt-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-2 py-6 text-sm text-muted-foreground">
                  Aucun résultat.
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((a, idx) => {
                    const ActiveIcon = a.icon as React.ElementType;
                    const active = idx === focusIdx;
                    return (
                      <li key={`${a.href}-${idx}`}>
                        <button
                          type="button"
                          onMouseEnter={() => setFocusIdx(idx)}
                          onClick={() => go(a.href)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-left text-sm",
                            active
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <ActiveIcon className="size-4 shrink-0" />
                          <span className="truncate">{a.label}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {a.href}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
