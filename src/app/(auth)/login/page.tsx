import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, dashboardPathForRole } from "@/lib/auth";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage the Mavira Solutions website.",
  robots: { index: false },
};

export default async function LoginPage(props: { searchParams: Promise<{ next?: string }> }) {
  const session = await auth();
  const { next } = await props.searchParams;
  if (session?.user) redirect(next && next.startsWith("/") ? next : dashboardPathForRole[session.user.role]);

  return (
    <div className="w-full max-w-md">
      <div className="rounded-modal border border-line bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-[14.5px] text-body">Sign in to manage the website content.</p>
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
        <div className="mt-5 text-[13.5px]">
          <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
