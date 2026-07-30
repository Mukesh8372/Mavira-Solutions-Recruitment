"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, LayoutDashboard, Menu, Phone, UserRound, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { mainNav, type NavGroup } from "@/config/nav";
import { roleDashboardPath } from "@/config/dashboard-nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SessionUser = { name?: string | null; role?: keyof typeof roleDashboardPath };

/** Lightweight session probe so the static header can show Sign in vs Dashboard. */
function useSessionUser(): SessionUser | null {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return user;
}

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

export type HeaderContact = { phone: string; phoneHref: string };

const defaultContact: HeaderContact = { phone: siteConfig.phone, phoneHref: siteConfig.phoneHref };

export function SiteHeader({ contact = defaultContact }: { contact?: HeaderContact }) {
  const scrolled = React.useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 24,
    () => false
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const user = useSessionUser();
  const dashboardHref = user?.role ? roleDashboardPath[user.role] : null;

  // Close the mobile menu on navigation (state adjustment during render).
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  React.useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-250",
        // Near-opaque fallback first: if backdrop-filter is unavailable the header
        // must still fully mask content scrolling underneath it.
        scrolled
          ? "border-line bg-background/95 shadow-soft backdrop-blur-xl supports-[backdrop-filter]:bg-background/85"
          : "border-transparent bg-background"
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 xl:flex">
          {mainNav.map((group) =>
            group.links ? (
              <MegaMenu key={group.label} group={group} pathname={pathname} />
            ) : (
              <Link
                key={group.label}
                href={group.href!}
                className={cn(
                  "rounded-lg px-3 py-2 text-[14.5px] font-semibold transition-colors hover:bg-primary-soft hover:text-primary",
                  pathname === group.href || (group.href !== "/" && pathname.startsWith(group.href!))
                    ? "text-primary"
                    : "text-body"
                )}
              >
                {group.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <a
            href={contact.phoneHref}
            className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-[13.5px] font-semibold text-body transition-colors hover:text-primary 2xl:flex"
          >
            <Phone className="size-3.5" aria-hidden />
            {contact.phone}
          </a>
          {dashboardHref ? (
            <Link
              href={dashboardHref}
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-body transition-colors hover:bg-primary-soft hover:text-primary lg:inline-flex xl:px-3"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-body transition-colors hover:bg-primary-soft hover:text-primary lg:inline-flex xl:px-3"
            >
              <UserRound className="size-4" aria-hidden />
              Sign in
            </Link>
          )}
          <ThemeToggle />
          <Link
            href="/candidates#upload-resume"
            className="hidden h-10 shrink-0 items-center whitespace-nowrap rounded-btn border border-line bg-surface px-4 text-[13.5px] font-semibold text-foreground shadow-soft transition-colors hover:border-faint md:inline-flex xl:hidden 2xl:inline-flex"
          >
            Upload Resume
          </Link>
          <Link
            href="/employers#request-talent"
            className="hidden h-10 shrink-0 items-center whitespace-nowrap rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow md:inline-flex"
          >
            Request Talent
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg border border-line text-foreground xl:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} pathname={pathname} dashboardHref={dashboardHref} contact={contact} />
    </header>
  );
}

function MegaMenu({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const active = group.links?.some((l) => pathname.startsWith(l.href));

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Close the menu on navigation (state adjustment during render).
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-[14.5px] font-semibold transition-colors hover:bg-primary-soft hover:text-primary",
          active || open ? "text-primary" : "text-body"
        )}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {group.label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-2",
              !group.featured && "w-72"
            )}
          >
            <div className="overflow-hidden rounded-card border border-line bg-surface p-3 shadow-lift">
              <div className={cn("grid gap-1", group.featured && "grid-cols-[1fr_220px] gap-3")}>
                <ul className={cn("grid gap-0.5", group.featured && "grid-cols-1")}>
                  {group.links!.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-lg px-3 py-2 transition-colors hover:bg-primary-soft"
                      >
                        <span className="block text-[14px] font-semibold text-foreground">{link.label}</span>
                        {link.description && <span className="block text-[12.5px] text-faint">{link.description}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
                {group.featured && (
                  <Link
                    href={group.featured.href}
                    className="group flex flex-col justify-end rounded-card bg-brand-gradient p-4 text-white transition-opacity hover:opacity-95"
                  >
                    <span className="text-[15px] font-bold">{group.featured.label}</span>
                    <span className="mt-1 text-[12.5px] leading-snug text-white/85">{group.featured.description}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold">
                      Get started
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNav({
  open,
  pathname,
  dashboardHref,
  contact,
}: {
  open: boolean;
  pathname: string;
  dashboardHref: string | null;
  contact: HeaderContact;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-background/95 backdrop-blur-xl xl:hidden"
        >
          <div className="container-site flex min-h-full flex-col gap-1 py-5">
            {mainNav.map((group) =>
              group.links ? (
                <MobileGroup key={group.label} group={group} />
              ) : (
                <Link
                  key={group.label}
                  href={group.href!}
                  className={cn(
                    "rounded-lg px-3 py-3 text-base font-semibold",
                    pathname === group.href ? "bg-primary-soft text-primary" : "text-foreground"
                  )}
                >
                  {group.label}
                </Link>
              )
            )}
            <div className="mt-auto flex flex-col gap-2.5 border-t border-line pt-5">
              <Link
                href={dashboardHref ?? "/login"}
                className="flex items-center gap-2 px-3 text-[14.5px] font-semibold text-primary"
              >
                {dashboardHref ? <LayoutDashboard className="size-4" aria-hidden /> : <UserRound className="size-4" aria-hidden />}
                {dashboardHref ? "My dashboard" : "Sign in / Create account"}
              </Link>
              <a href={contact.phoneHref} className="flex items-center gap-2 px-3 text-[14.5px] font-semibold text-body">
                <Phone className="size-4" aria-hidden />
                {contact.phone}
              </a>
              <Link
                href="/candidates#upload-resume"
                className="inline-flex h-12 items-center justify-center rounded-btn border border-line bg-surface text-[15px] font-semibold text-foreground"
              >
                Upload Resume
              </Link>
              <Link
                href="/employers#request-talent"
                className="inline-flex h-12 items-center justify-center rounded-btn bg-primary text-[15px] font-semibold text-white"
              >
                Request Talent
              </Link>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

function MobileGroup({ group }: { group: NavGroup }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-semibold text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {group.label}
        <ChevronDown className={cn("size-4 text-faint transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <ul className="mb-1 ml-3 border-l border-line pl-3">
          {group.links!.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="block rounded-lg px-3 py-2.5 text-[14.5px] font-medium text-body">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
