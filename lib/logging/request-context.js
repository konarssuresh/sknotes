import { randomUUID } from "node:crypto";

const REQUEST_ID_HEADER = "x-request-id";

export function createRequestId() {
  return randomUUID();
}

/**
 * @param {Request} request
 */
export function getOrCreateRequestId(request) {
  const existing = request.headers.get(REQUEST_ID_HEADER);
  if (existing && existing.length <= 128) {
    return existing;
  }
  return createRequestId();
}

export { REQUEST_ID_HEADER };

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "content",
  "title",
  "plainText",
]);

export function redactForLog(value, depth = 0) {
  if (depth > 4) {
    return "[truncated]";
  }
  if (value == null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactForLog(item, depth + 1));
  }
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      out[key] = "[redacted]";
    } else {
      out[key] = redactForLog(val, depth + 1);
    }
  }
  return out;
}
