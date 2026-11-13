import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows `limit` hits in a window, then blocks until the window slides", () => {
    const key = `test:${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
    vi.advanceTimersByTime(59_000);
    expect(rateLimit(key, opts).ok).toBe(false);
    vi.advanceTimersByTime(1_500);
    expect(rateLimit(key, opts).ok).toBe(true);
  });

  it("keeps keys independent", () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    expect(rateLimit(a, { limit: 1 }).ok).toBe(true);
    expect(rateLimit(a, { limit: 1 }).ok).toBe(false);
    expect(rateLimit(b, { limit: 1 }).ok).toBe(true);
  });
});
