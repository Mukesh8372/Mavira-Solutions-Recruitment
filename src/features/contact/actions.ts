"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(16, "Enter a valid phone number").optional(),
  audience: z.enum(["EMPLOYER", "CANDIDATE", "OTHER"], { message: "Tell us who you are" }),
  message: z.string().trim().min(10, "Tell us a little more — at least 10 characters").max(2000, "Keep your message under 2000 characters"),
  // Honeypot — humans never fill this.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactResult = { ok: true } | { ok: false; error: string };

/** General contact-page query. */
export async function createContactQuery(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (parsed.data.website) return { ok: true }; // silently drop bots

  const { ok } = rateLimit(await clientKey("contact"), { limit: 3, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many messages from this device. Please try again in a few minutes." };

  await prisma.contactQuery.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      audience: parsed.data.audience,
      message: parsed.data.message,
    },
  });

  return { ok: true };
}
