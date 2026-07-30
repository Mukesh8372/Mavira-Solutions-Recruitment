"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  // Honeypot — humans never fill this.
  website: z.string().max(0).optional(),
});

export type NewsletterResult = { ok: true } | { ok: false; error: string };

export async function subscribeNewsletter(input: { email: string; website?: string }): Promise<NewsletterResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (parsed.data.website) return { ok: true }; // silently drop bots

  const { ok } = rateLimit(await clientKey("newsletter"), { limit: 3, windowMs: 60_000 });
  if (!ok) return { ok: false, error: "Too many attempts. Please try again in a minute." };

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    create: { email: parsed.data.email.toLowerCase() },
    update: { unsubscribedAt: null },
  });
  return { ok: true };
}
