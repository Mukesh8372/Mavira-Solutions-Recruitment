export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; href?: string; links?: NavLink[]; featured?: NavLink };

export const services: NavLink[] = [
  { label: "Permanent Hiring", href: "/services/permanent-hiring", description: "Full-time talent, success-fee only" },
  { label: "Contract Staffing", href: "/services/contract-staffing", description: "Flexible, compliant workforce" },
  { label: "Executive Search", href: "/services/executive-search", description: "Confidential leadership hiring" },
  { label: "Bulk Hiring", href: "/services/bulk-hiring", description: "Volume drives, fast ramp-ups" },
  { label: "Campus Hiring", href: "/services/campus-hiring", description: "Graduate programs at scale" },
  { label: "Payroll Services", href: "/services/payroll-services", description: "Compliant payroll outsourcing" },
  { label: "HR Consulting", href: "/services/hr-consulting", description: "Policies, comp & org design" },
];

export const mainNav: NavGroup[] = [
  { label: "Services", links: services, featured: { label: "Request Talent", href: "/employers#request-talent", description: "Tell us who you need — shortlist in 3–5 days" } },
  { label: "Jobs", href: "/jobs" },
  { label: "Employers", href: "/employers" },
  { label: "Candidates", href: "/candidates" },
  {
    label: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "Our Process", href: "/process" },
      { label: "Industries We Serve", href: "/industries" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Testimonials", href: "/testimonials" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "Our Process", href: "/process" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "For Employers",
    links: [
      ...services.slice(0, 5).map(({ label, href }) => ({ label, href })),
      { label: "Request Talent", href: "/employers#request-talent" },
    ],
  },
  {
    heading: "For Candidates",
    links: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Upload Resume", href: "/candidates#upload-resume" },
      { label: "Career Advice", href: "/blog/category/career-advice" },
      { label: "Candidate Services", href: "/candidates" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Industries", href: "/industries" },
      { label: "Hiring Insights", href: "/blog/category/hiring-insights" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];
