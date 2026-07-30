import { redirect } from "next/navigation";
import { auth, dashboardPathForRole } from "@/lib/auth";

export default async function CandidateAreaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");
  if (session.user.role !== "CANDIDATE") redirect(dashboardPathForRole[session.user.role]);
  return <>{children}</>;
}
