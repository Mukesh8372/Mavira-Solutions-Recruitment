import type { Role } from "@prisma/client";

export type DashboardNavItem = { label: string; href: string; icon: string };

export const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "layout-dashboard" },
  { label: "Leads", href: "/admin/leads", icon: "target" },
  { label: "Contact queries", href: "/admin/queries", icon: "mail" },
  { label: "Site content", href: "/admin/site-content", icon: "globe" },
  { label: "Blog", href: "/admin/blog", icon: "newspaper" },
  { label: "Success stories", href: "/admin/success-stories", icon: "award" },
  { label: "FAQs", href: "/admin/faqs", icon: "circle-help" },
  { label: "Industries", href: "/admin/industries", icon: "factory" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "quote" },
  { label: "Newsletter", href: "/admin/newsletter", icon: "send" },
  { label: "Users & roles", href: "/admin/users", icon: "shield" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

/** Client-safe map: where each role lands after sign-in. */
export const roleDashboardPath: Record<Role, string> = {
  ADMIN: "/admin",
  STAFF: "/admin",
  EMPLOYER: "/",
  CANDIDATE: "/",
};

export function navForRole(role: Role): DashboardNavItem[] {
  if (role === "ADMIN" || role === "STAFF") return adminNav;
  return [];
}
