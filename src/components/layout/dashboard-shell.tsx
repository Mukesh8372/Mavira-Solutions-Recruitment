"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { DashboardIcon } from "@/components/shared/dashboard-icon";
import { logout } from "@/features/auth/actions";
import type { DashboardNavItem } from "@/config/dashboard-nav";
import { cn } from "@/lib/utils";

export function DashboardShell({
  nav,
  user,
  roleLabel,
  children,
}: {
  nav: DashboardNavItem[];
  user: { name: string; email: string };
  roleLabel: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the mobile sidebar on navigation (state adjustment during render).
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  const navList = (
    <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-semibold transition-colors",
                  active ? "bg-primary-soft text-primary" : "text-body hover:bg-background-alt hover:text-foreground"
                )}
              >
                <DashboardIcon name={item.icon} className="size-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo />
        </div>
        {navList}
        <div className="border-t border-line p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-semibold text-faint transition-colors hover:bg-background-alt hover:text-foreground"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Back to website
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-surface shadow-lift">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
                className="grid size-9 place-items-center rounded-lg border border-line text-body"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            {navList}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="grid size-9 place-items-center rounded-lg border border-line text-body lg:hidden"
            >
              <Menu className="size-4" aria-hidden />
            </button>
            <span className="rounded-full bg-secondary-soft px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-secondary">
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>
        <main id="main-content" className="flex-1 bg-background-alt p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function UserMenu({ user }: { user: { name: string; email: string } }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-2 transition-colors hover:border-faint"
      >
        <Avatar name={user.name} className="size-7 text-[11px]" />
        <span className="hidden max-w-32 truncate text-[13.5px] font-semibold text-foreground sm:block">{user.name}</span>
        <ChevronDown className={cn("size-3.5 text-faint transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-line bg-surface p-2 shadow-lift">
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            <p className="truncate text-[13.5px] font-bold text-foreground">{user.name}</p>
            <p className="truncate text-[12px] text-faint">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              await logout();
              router.push("/");
              router.refresh();
            }}
            className="mt-1.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-semibold text-destructive transition-colors hover:bg-destructive/8"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
