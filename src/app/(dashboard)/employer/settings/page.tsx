import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChangePasswordForm } from "@/features/auth/change-password-form";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function EmployerSettingsPage() {
  const session = await auth();
  return (
    <>
      <PageHeader title="Settings" description="Account and security." />
      <div className="space-y-6">
        <section aria-labelledby="account-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="account-heading" className="mb-3 text-[16px] font-bold">
            Account
          </h2>
          <dl className="space-y-2 text-[14px]">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-faint">Name</dt>
              <dd className="font-semibold text-foreground">{session!.user.name}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-faint">Email</dt>
              <dd className="font-semibold text-foreground">{session!.user.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 text-faint">Role</dt>
              <dd className="font-semibold text-foreground">Employer</dd>
            </div>
          </dl>
        </section>
        <section aria-labelledby="security-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="security-heading" className="mb-4 text-[16px] font-bold">
            Change password
          </h2>
          <ChangePasswordForm />
        </section>
      </div>
    </>
  );
}
