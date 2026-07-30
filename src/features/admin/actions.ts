"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { labelApplicationStatus } from "@/lib/format";
import { slugify, shortId } from "@/lib/utils";

export type AdminActionResult = { ok: true; message?: string } | { ok: false; error: string };

const notStaff = { ok: false, error: "You need admin or staff access for this." } as const;

async function requireStaff() {
  return requireRole(["ADMIN", "STAFF"]);
}

/** Every mutating admin action writes an AuditLog row so changes are traceable. */
async function audit(actorId: string, action: string, entity: string, entityId: string, diff?: unknown) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      diff: diff === undefined ? undefined : JSON.stringify(diff),
    },
  });
}

/* ------------------------------------------------------------------ Jobs */

const jobStatusSchema = z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]);

const jobStatusAction: Record<z.infer<typeof jobStatusSchema>, string> = {
  DRAFT: "job.unpublish",
  PUBLISHED: "job.publish",
  CLOSED: "job.close",
  ARCHIVED: "job.archive",
};

export async function setJobStatus(jobId: string, status: string): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = jobStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid job status." };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return { ok: false, error: "Job not found." };
  if (job.status === parsed.data) return { ok: true, message: "No change — job already in that state." };

  const publishing = parsed.data === "PUBLISHED";
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: parsed.data,
      ...(publishing && {
        publishedAt: job.publishedAt ?? new Date(),
        validThrough: new Date(Date.now() + 45 * 86_400_000),
      }),
    },
  });
  await audit(session.user.id, jobStatusAction[parsed.data], "Job", jobId, { from: job.status, to: parsed.data });

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${job.slug}`);
  return { ok: true, message: publishing ? "Job published" : `Job marked ${parsed.data.toLowerCase()}` };
}

const jobFlagsSchema = z.object({
  featured: z.boolean().optional(),
  urgent: z.boolean().optional(),
});

export async function updateJobFlags(
  jobId: string,
  flags: z.infer<typeof jobFlagsSchema>
): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = jobFlagsSchema.safeParse(flags);
  if (!parsed.success) return { ok: false, error: "Invalid flags." };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return { ok: false, error: "Job not found." };

  await prisma.job.update({ where: { id: jobId }, data: parsed.data });
  await audit(session.user.id, "job.flags", "Job", jobId, {
    from: { featured: job.featured, urgent: job.urgent },
    to: { featured: parsed.data.featured ?? job.featured, urgent: parsed.data.urgent ?? job.urgent },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${job.slug}`);
  return { ok: true, message: "Job updated" };
}

/* ---------------------------------------------------------- Applications */

const applicationStatusSchema = z.enum([
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "PLACED",
  "REJECTED",
  "WITHDRAWN",
]);

export async function adminUpdateApplicationStatus(id: string, status: string): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = applicationStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid application status." };

  const application = await prisma.application.findUnique({
    where: { id },
    include: { job: { include: { company: true } }, candidate: true },
  });
  if (!application) return { ok: false, error: "Application not found." };
  if (application.status === parsed.data) return { ok: true, message: "Status unchanged." };

  const history = JSON.parse((application.statusHistory as string) || "[]") as unknown[];
  await prisma.application.update({
    where: { id },
    data: {
      status: parsed.data,
      statusHistory: JSON.stringify([...history, { status: parsed.data, at: new Date().toISOString() }]),
    },
  });
  await prisma.notification.create({
    data: {
      userId: application.candidate.userId,
      type: "APPLICATION_STATUS",
      title: `Update on your application — ${application.job.title}`,
      body: `${application.job.company.name}: your application is now "${labelApplicationStatus(parsed.data)}".`,
      link: "/dashboard/applications",
    },
  });
  await audit(session.user.id, "application.status", "Application", id, {
    from: application.status,
    to: parsed.data,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard/applications");
  return { ok: true, message: `Moved to ${labelApplicationStatus(parsed.data)}` };
}

/* ------------------------------------------------------------------ Leads */

const leadStatusSchema = z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]);

export async function updateLeadStatus(id: string, status: string): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Invalid lead status." };

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return { ok: false, error: "Lead not found." };
  if (lead.status === parsed.data) return { ok: true, message: "Status unchanged." };

  await prisma.lead.update({ where: { id }, data: { status: parsed.data } });
  await audit(session.user.id, "lead.status", "Lead", id, { from: lead.status, to: parsed.data });

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  return { ok: true, message: "Lead updated" };
}

/* -------------------------------------------------------- Contact queries */

export async function markQueryHandled(id: string, handled: boolean): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const query = await prisma.contactQuery.findUnique({ where: { id } });
  if (!query) return { ok: false, error: "Query not found." };

  await prisma.contactQuery.update({ where: { id }, data: { handled: Boolean(handled) } });
  await audit(session.user.id, handled ? "query.handled" : "query.reopened", "ContactQuery", id);

  revalidatePath("/admin");
  revalidatePath("/admin/queries");
  return { ok: true, message: handled ? "Marked handled" : "Reopened" };
}

/* ----------------------------------------------------------- Testimonials */

export async function setTestimonialApproval(id: string, approved: boolean): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) return { ok: false, error: "Testimonial not found." };

  await prisma.testimonial.update({ where: { id }, data: { approved: Boolean(approved) } });
  await audit(session.user.id, approved ? "testimonial.approve" : "testimonial.unapprove", "Testimonial", id);

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: true, message: approved ? "Testimonial approved" : "Approval removed" };
}

export async function setTestimonialFeatured(id: string, featured: boolean): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) return { ok: false, error: "Testimonial not found." };

  await prisma.testimonial.update({ where: { id }, data: { featured: Boolean(featured) } });
  await audit(session.user.id, "testimonial.feature", "Testimonial", id, {
    from: testimonial.featured,
    to: Boolean(featured),
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: true, message: featured ? "Marked featured" : "Removed from featured" };
}

export async function deleteTestimonial(id: string): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) return { ok: false, error: "Testimonial not found." };

  await prisma.testimonial.delete({ where: { id } });
  await audit(session.user.id, "testimonial.delete", "Testimonial", id, { authorName: testimonial.authorName });

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { ok: true, message: "Testimonial deleted" };
}

/* ------------------------------------------------------------------- Blog */

const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Add a title").max(120, "Keep the title under 120 characters"),
  slug: z.string().trim().max(80).optional(),
  excerpt: z.string().trim().min(10, "Add a short excerpt").max(300, "Keep the excerpt under 300 characters"),
  content: z.string().trim().min(50, "The post body looks too short"),
  category: z.enum(["career-advice", "hiring-insights", "industry-news"]),
  tags: z.string().trim().max(200).optional(), // comma-separated
  readMinutes: z.coerce.number().int().min(1).max(60),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type BlogPostInput = z.input<typeof blogPostSchema>;

export async function saveBlogPost(input: BlogPostInput): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const existing = data.id ? await prisma.blogPost.findUnique({ where: { id: data.id } }) : null;
  if (data.id && !existing) return { ok: false, error: "Post not found." };

  // Slug: use what was typed, else derive from the title. Must be unique.
  const slugWasAuto = !data.slug;
  let slug = slugify(data.slug || data.title);
  if (!slug) return { ok: false, error: "Couldn't derive a slug — add one manually." };
  const clash = await prisma.blogPost.findUnique({ where: { slug } });
  if (clash && clash.id !== existing?.id) {
    if (!slugWasAuto) return { ok: false, error: `The slug "${slug}" is already in use — pick another.` };
    slug = `${slug.slice(0, 55)}-${shortId()}`;
  }

  const tags = (data.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  const common = {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    tags: JSON.stringify(tags),
    readMinutes: data.readMinutes,
    status: data.status,
  };

  let postId: string;
  if (existing) {
    await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        ...common,
        // Set publishedAt only on the first publish; keep the original date afterwards.
        publishedAt: data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
    });
    postId = existing.id;
    await audit(session.user.id, "blog.update", "BlogPost", postId, { slug, status: data.status });
  } else {
    const created = await prisma.blogPost.create({
      data: {
        ...common,
        authorId: session.user.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    postId = created.id;
    await audit(session.user.id, "blog.create", "BlogPost", postId, { slug, status: data.status });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { ok: true, message: existing ? "Post saved" : "Post created" };
}

export async function deleteBlogPost(id: string): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { ok: false, error: "Post not found." };

  await prisma.blogPost.delete({ where: { id } });
  await audit(session.user.id, "blog.delete", "BlogPost", id, { slug: post.slug, title: post.title });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, message: "Post deleted" };
}

/* ---------------------------------------------------------- Users & roles */

const roleSchema = z.enum(["ADMIN", "STAFF", "EMPLOYER", "CANDIDATE"]);

export async function setUserRole(userId: string, role: string): Promise<AdminActionResult> {
  // Role changes are ADMIN-only — STAFF cannot escalate anyone (or themselves).
  const session = await requireRole(["ADMIN"]);
  if (!session) return { ok: false, error: "Only admins can change roles." };
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: "Invalid role." };

  if (userId === session.user.id && parsed.data !== "ADMIN") {
    return { ok: false, error: "You can't demote your own account." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { employerProfile: true } });
  if (!user) return { ok: false, error: "User not found." };
  if (user.role === parsed.data) return { ok: true, message: "Role unchanged." };

  if (parsed.data === "EMPLOYER" && !user.employerProfile) {
    return { ok: false, error: "Attach a company first (not supported in this build)." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role: parsed.data } });
  await audit(session.user.id, "user.role", "User", userId, { from: user.role, to: parsed.data });

  revalidatePath("/admin/users");
  return { ok: true, message: `Role set to ${parsed.data.toLowerCase()}` };
}

/* -------------------------------------------------------------- Newsletter */

export async function deleteSubscriber(id: string): Promise<AdminActionResult> {
  const session = await requireStaff();
  if (!session) return notStaff;

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!subscriber) return { ok: false, error: "Subscriber not found." };

  await prisma.newsletterSubscriber.delete({ where: { id } });
  await audit(session.user.id, "newsletter.delete", "NewsletterSubscriber", id, { email: subscriber.email });

  revalidatePath("/admin");
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Subscriber removed" };
}
