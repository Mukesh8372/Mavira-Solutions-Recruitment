import { redirect } from "next/navigation";
import { auth, dashboardPathForRole } from "@/lib/auth";

export default async function EmployerAreaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/employer");
  if (session.user.role !== "EMPLOYER") redirect(dashboardPathForRole[session.user.role]);
  return <>{children}</>;
}
