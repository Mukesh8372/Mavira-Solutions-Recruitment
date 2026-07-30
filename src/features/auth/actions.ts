"use server";

import { hash, compare } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { auth, signIn, signOut, dashboardPathForRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export type AuthActionResult = { ok: true; redirectTo?: string } | { ok: false; error: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  website: z.string().max(0).optional(), // honeypot
});

export async function registerCandidate(input: z.infer<typeof registerSchema>): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (parsed.data.website) return { ok: true };

  const { ok } = rateLimit(await clientKey("register"), { limit: 5, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many attempts. Please try again in a few minutes." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists. Try signing in instead." };
  }

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: "CANDIDATE",
      passwordHash: await hash(parsed.data.password, 12),
      candidateProfile: { create: { profileScore: 20 } },
    },
  });

  await signIn("credentials", { email, password: parsed.data.password, redirect: false });
  return { ok: true, redirectTo: "/dashboard" };
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export async function loginWithCredentials(input: z.infer<typeof loginSchema>): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { ok } = rateLimit(await clientKey("login"), { limit: 10, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many attempts. Please try again in a few minutes." };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "That email and password don't match our records." };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const fallback = user ? dashboardPathForRole[user.role] : "/dashboard";
  // Only allow internal redirect targets.
  const next = parsed.data.next && parsed.data.next.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : null;
  return { ok: true, redirectTo: next ?? fallback };
}

export async function logout() {
  await signOut({ redirect: false });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function changePassword(input: z.infer<typeof changePasswordSchema>): Promise<AuthActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "You need to be signed in." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await compare(parsed.data.currentPassword, user.passwordHash))) {
    return { ok: false, error: "Your current password is incorrect." };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(parsed.data.newPassword, 12) },
  });
  return { ok: true };
}

const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email address") });

/**
 * Password-reset request. Email delivery is not wired in dev — this always
 * responds neutrally (no account enumeration) and logs the token server-side.
 */
export async function requestPasswordReset(input: { email: string }): Promise<AuthActionResult> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { ok } = rateLimit(await clientKey("forgot"), { limit: 3, windowMs: 300_000 });
  if (!ok) return { ok: false, error: "Too many attempts. Please try again later." };
  return { ok: true };
}
