import { z } from "zod";

const cursorPayloadSchema = z.object({
  updatedAt: z.string().datetime(),
  id: z.string().min(1),
});

/**
 * @param {{ updatedAt: Date | string; id: string }} params
 */
export function encodeNoteCursor({ updatedAt, id }) {
  const iso =
    updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt);
  const payload = JSON.stringify({ updatedAt: iso, id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * @param {string} cursor
 */
export function decodeNoteCursor(cursor) {
  const raw = Buffer.from(cursor, "base64url").toString("utf8");
  const parsed = cursorPayloadSchema.parse(JSON.parse(raw));
  return {
    updatedAt: new Date(parsed.updatedAt),
    id: parsed.id,
  };
}
