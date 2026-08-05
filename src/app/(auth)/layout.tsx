import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[560px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(62,80,131,.12), transparent 70%), radial-gradient(closest-side, rgba(169,123,23,.08), transparent 70%)",
        }}
      />
      <header className="relative">
        <div className="container-site flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body hover:text-primary">
              <ArrowLeft className="size-3.5" aria-hidden />
              Back to site
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content" className="relative flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
