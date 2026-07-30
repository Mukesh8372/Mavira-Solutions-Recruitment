import { redirect } from "next/navigation";
import { auth, dashboardPathForRole } from "@/lib/auth";

export default async function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect(dashboardPathForRole[session.user.role]);
  }
  return <>{children}</>;
}
