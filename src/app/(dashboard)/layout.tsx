import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { navForRole } from "@/config/dashboard-nav";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const roleLabels = { ADMIN: "Admin", STAFF: "Staff", EMPLOYER: "Employer", CANDIDATE: "Candidate" } as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <DashboardShell
      nav={navForRole(session.user.role)}
      user={{ name: session.user.name ?? "User", email: session.user.email ?? "" }}
      roleLabel={roleLabels[session.user.role]}
    >
      {children}
    </DashboardShell>
  );
}
