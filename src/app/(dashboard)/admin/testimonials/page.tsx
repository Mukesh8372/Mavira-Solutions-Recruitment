import type { Metadata } from "next";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { TestimonialActions } from "@/features/admin/testimonial-actions";
import { getAdminTestimonials } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Testimonials — Admin", robots: { index: false } };

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Approve what shows on the site. Featured ones lead the homepage carousel."
      />
      {testimonials.length === 0 ? (
        <EmptyState icon="quote" title="No testimonials yet" body="Client and candidate testimonials will be curated here." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.id} className="flex flex-col rounded-card border border-line bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={t.kind === "CLIENT" ? "purple" : "blue"}>{t.kind === "CLIENT" ? "Client" : "Candidate"}</Badge>
                <Badge variant={t.approved ? "green" : "amber"}>{t.approved ? "Approved" : "Pending"}</Badge>
                {t.featured && <Badge variant="blue">Featured</Badge>}
              </div>
              <blockquote className="mt-3 line-clamp-4 text-[13.5px] leading-relaxed text-body">
                “{t.quote}”
              </blockquote>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[13px]">
                  <span className="font-bold text-foreground">{t.authorName}</span>
                  <span className="block text-[12px] text-faint">
                    {t.authorRole}
                    {t.company ? ` · ${t.company}` : ""}
                  </span>
                </p>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-warning" aria-label={`Rated ${t.rating} out of 5`}>
                  <Star className="size-3.5 fill-current" aria-hidden />
                  {t.rating}/5
                </span>
              </div>
              <div className="mt-auto border-t border-line pt-4 [&:not(:first-child)]:mt-4">
                <TestimonialActions testimonialId={t.id} approved={t.approved} featured={t.featured} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
