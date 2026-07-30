import "server-only";

/**
 * In-memory sliding-window rate limiter for public form mutations.
 * Adequate for a single-instance deployment; swap for Upstash Ratelimit
 * (same interface) when scaling horizontally.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, { limit = 5, windowMs = 60_000 } = {}): { ok: boolean } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false };
  }
  hits.push(now);
  buckets.set(key, hits);
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return { ok: true };
}

export async function clientKey(scope: string): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
  return `${scope}:${ip}`;
}
