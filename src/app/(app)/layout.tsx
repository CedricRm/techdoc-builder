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
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr] bg-gray-50 text-gray-900">
      {/* Sidebar (collapsible on mobile) */}
      <Sidebar />

      {/* Main */}
      <div className="flex min-h-dvh flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
