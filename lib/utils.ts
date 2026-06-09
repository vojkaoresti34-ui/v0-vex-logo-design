import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Recursively strips script tags, event handlers, and javascript: URIs from
 * strings/objects/arrays to prevent stored XSS.
 */
export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/on\w+\s*=\s*'[^']*'/gi, "")
      .replace(/on\w+\s*=\s*javascript:[^"'\s]*/gi, "")
      .replace(/javascript\s*:[^"'\s]*/gi, "")
      .trim() as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }
  if (typeof input === "object" && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(input as object)) {
      sanitized[key] = sanitizeInput((input as Record<string, unknown>)[key]);
    }
    return sanitized as T;
  }
  return input;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitCache = new Map<string, RateLimitRecord>();

// Prune expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitCache) {
    if (now > record.resetTime) rateLimitCache.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Fixed-window IP rate limiter.
 * Returns true if the identifier has exceeded `limit` requests within `windowMs`.
 */
export function isRateLimited(
  identifier: string,
  limit = 60,
  windowMs = 60 * 1000
): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > limit;
}
