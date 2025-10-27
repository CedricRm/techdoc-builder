// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseClient.server";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh  bg-background text-foreground">
      <Sidebar />
      {/* Main column */}
      <div className="flex min-h-dvh flex-col w-full! min-w-0! with-sidebar">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
