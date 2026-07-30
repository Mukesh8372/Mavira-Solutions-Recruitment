import type { Role } from "@prisma/client";

export type DashboardNavItem = { label: string; href: string; icon: string };

export const candidateNav: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { label: "My applications", href: "/dashboard/applications", icon: "file-text" },
  { label: "Saved jobs", href: "/dashboard/saved", icon: "heart" },
  { label: "Interviews", href: "/dashboard/interviews", icon: "calendar" },
  { label: "Resume & profile", href: "/dashboard/profile", icon: "user" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "bell" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export const employerNav: DashboardNavItem[] = [
  { label: "Overview", href: "/employer", icon: "layout-dashboard" },
  { label: "Post a job", href: "/employer/jobs/new", icon: "plus-circle" },
  { label: "My jobs", href: "/employer/jobs", icon: "briefcase" },
  { label: "Applications", href: "/employer/applications", icon: "inbox" },
  { label: "Interviews", href: "/employer/interviews", icon: "calendar" },
  { label: "Company profile", href: "/employer/company", icon: "building" },
  { label: "Reports", href: "/employer/reports", icon: "bar-chart" },
  { label: "Settings", href: "/employer/settings", icon: "settings" },
];

export const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "layout-dashboard" },
  { label: "Jobs", href: "/admin/jobs", icon: "briefcase" },
  { label: "Applications", href: "/admin/applications", icon: "inbox" },
  { label: "Candidates", href: "/admin/candidates", icon: "users" },
  { label: "Employers", href: "/admin/employers", icon: "building" },
  { label: "Interviews", href: "/admin/interviews", icon: "calendar" },
  { label: "Leads", href: "/admin/leads", icon: "target" },
  { label: "Contact queries", href: "/admin/queries", icon: "mail" },
  { label: "Blog", href: "/admin/blog", icon: "newspaper" },
  { label: "Site content", href: "/admin/site-content", icon: "globe" },
  { label: "Success stories", href: "/admin/success-stories", icon: "award" },
  { label: "FAQs", href: "/admin/faqs", icon: "circle-help" },
  { label: "Industries", href: "/admin/industries", icon: "factory" },
  { label: "Job categories", href: "/admin/departments", icon: "tags" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "quote" },
  { label: "Newsletter", href: "/admin/newsletter", icon: "send" },
  { label: "Users & roles", href: "/admin/users", icon: "shield" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

/** Client-safe map: where each role lands after sign-in. */
export const roleDashboardPath: Record<Role, string> = {
  ADMIN: "/admin",
  STAFF: "/admin",
  EMPLOYER: "/employer",
  CANDIDATE: "/dashboard",
};

export function navForRole(role: Role): DashboardNavItem[] {
  if (role === "ADMIN" || role === "STAFF") return adminNav;
  if (role === "EMPLOYER") return employerNav;
  return candidateNav;
}
