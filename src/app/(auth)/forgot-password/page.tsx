import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a password reset link.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-modal border border-line bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-1.5 text-[14.5px] text-body">
          Enter the email you signed up with and we&apos;ll send a reset link.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
        <p className="mt-5 text-center text-[13.5px] text-body">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
