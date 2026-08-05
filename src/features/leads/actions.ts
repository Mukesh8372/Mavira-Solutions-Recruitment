"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const HIRING_TYPES = [
  "Permanent Recruitment",
  "Executive Search",
  "Bulk Hiring",
  "BFSI Recruitment",
  "Broking Recruitment",
  "Not sure",
] as const;

const leadSchema = z.object({
  companyName: z.string().trim().min(2, "Enter your company name").max(120),
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid work email"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  hiringType: z.enum(HIRING_TYPES, { message: "Choose what you're hiring for" }),
  rolesNeeded: z.string().trim().max(200, "Keep this under 200 characters").optional(),
  message: z.string().trim().max(1500, "Keep your message under 1500 characters").optional(),
  // Honeypot — humans never fill this.
  website: z.string().max(0).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadResult = { ok: true } | { ok: false; error: string };

/** Employer "Request Talent" lead capture. */
export async function createLead(input: LeadInput): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (parsed.data.website) return { ok: true }; // silently drop bots

  const { ok } = rateLimit(await clientKey("lead"), { limit: 3, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many requests from this device. Please try again in a few minutes." };

  await prisma.lead.create({
    data: {
      kind: "REQUEST_TALENT",
      companyName: parsed.data.companyName,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      hiringType: parsed.data.hiringType,
      rolesNeeded: parsed.data.rolesNeeded || null,
      message: parsed.data.message || null,
    },
  });

  return { ok: true };
}
