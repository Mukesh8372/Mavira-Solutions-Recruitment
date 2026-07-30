import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, dashboardPathForRole } from "@/lib/auth";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create your free candidate account",
  description: "Track applications, save jobs and get matched with roles. Always free for candidates.",
  robots: { index: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect(dashboardPathForRole[session.user.role]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-modal border border-line bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-[14.5px] text-body">
          Track every application, save jobs and get matched with new roles. Free, forever.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-5 text-center text-[13.5px] text-body">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <p className="mt-5 text-center text-[12.5px] text-faint">
        Hiring? Employer accounts are provisioned by our team —{" "}
        <Link href="/employers#request-talent" className="font-semibold text-primary hover:underline">
          request talent
        </Link>{" "}
        to get started.
      </p>
    </div>
  );
}
