import { supabaseServer } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Welcome back, {data.user.email}
      </h1>
    </div>
  );
}
