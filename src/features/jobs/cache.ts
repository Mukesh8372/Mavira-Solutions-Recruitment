import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Every page that reads the Job table. Call after any job mutation.
 * revalidatePath refreshes only the paths named here (Next 16).
 */
export function revalidateJobPages() {
  revalidatePath("/"); // "Current openings" section
  revalidatePath("/jobs");
  revalidatePath("/jobs/[slug]", "page");
  revalidatePath("/jobs/category/[slug]", "page");
  revalidatePath("/industries/[slug]", "page"); // industry pages list their open jobs
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/applications");
}
