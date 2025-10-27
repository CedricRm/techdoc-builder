"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  LayoutGrid,
  FileText,
  FolderKanban,
  Settings,
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

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/projects", label: "Projets", icon: FolderKanban },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);

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
              <Menu className="size-4" /> Menu
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
            <Separator />
            <div className="m-4 rounded-md border bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Espace utilisé</p>
              <div className="mt-2 h-2 w-full rounded-full bg-background">
                <div className="h-2 w-2/5 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-1">4.2 GB / 10 GB</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: static sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:border-r lg:bg-background lg:shadow-none lg:overflow-y-auto transition-[width] duration-200",
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
            {!collapsed && <Link href="/dashboard">TechDoc‑Builder</Link>}
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
          <div className="mt-auto rounded-md border bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Espace utilisé</p>
            <div className="mt-2 h-2 w-full rounded-full bg-background">
              <div className="h-2 w-2/5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1">4.2 GB / 10 GB</p>
          </div>
        </div>
      </aside>
    </>
  );
}
