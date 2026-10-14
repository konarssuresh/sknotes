import "server-only";

import { RATE_LIMIT_COLLECTION } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

/**
 * Mongo-backed sliding window rate limit for custom Route Handlers.
 * @param {{ key: string; windowSeconds: number; max: number }} options
 */
export async function consumeRateLimit({ key, windowSeconds, max }) {
  const db = await getDb();
  const collection = db.collection(RATE_LIMIT_COLLECTION);
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  await collection.createIndex({ key: 1 }, { name: "rate_limit_key" });
  await collection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "rate_limit_ttl" }
  );

  const existing = await collection.findOne({ key });
  if (!existing || existing.windowStart < windowStart) {
    await collection.updateOne(
      { key },
      {
        $set: {
          key,
          count: 1,
          windowStart: now,
          expiresAt: new Date(now + windowSeconds * 1000),
        },
      },
      { upsert: true }
    );
    return;
  }

  if (existing.count >= max) {
    const retryAfter = Math.ceil(
      (existing.windowStart + windowSeconds * 1000 - now) / 1000
    );
    throw new ApiError(
      ErrorCodes.RATE_LIMITED,
      "Too many requests. Please try again later.",
      429,
      { retryAfter }
    );
  }

  await collection.updateOne(
    { key },
    {
      $inc: { count: 1 },
      $set: { expiresAt: new Date(now + windowSeconds * 1000) },
    }
  );
}

/**
 * @param {Request} request
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
