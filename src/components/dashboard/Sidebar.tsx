"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutGrid,
  FileText,
  FolderKanban,
  Settings,
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

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/projects", label: "Projets", icon: FolderKanban },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const NavLink = ({
    href,
    label,
    Icon,
  }: {
    href: string;
    label: string;
    Icon: React.ElementType;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        <Icon className="size-4" /> {label}
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
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-[260px] lg:border-r lg:bg-background lg:shadow-none"
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="mb-2 px-2 text-sm font-semibold">
            <Link href="/dashboard">TechDoc‑Builder</Link>
          </div>
          <nav className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} />
            ))}
          </nav>
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
