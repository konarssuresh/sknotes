import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

/**
 * @param {Request} request
 * @param {number} maxBytes
 */
export async function readJsonBody(request, maxBytes = 65_536) {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(length) && length > maxBytes) {
      throw new ApiError(
        ErrorCodes.PAYLOAD_TOO_LARGE,
        "Request body is too large",
        413
      );
    }
  }

  const raw = await request.text();
  if (raw.length > maxBytes) {
    throw new ApiError(
      ErrorCodes.PAYLOAD_TOO_LARGE,
      "Request body is too large",
      413
    );
  }

  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "Request body must be valid JSON",
      400
    );
  }
}

/**
 * @template {import('zod').ZodTypeAny} T
 * @param {Request} request
 * @param {T} schema
 * @param {number} [maxBytes]
 */
export async function parseJsonBody(request, schema, maxBytes) {
  const json = await readJsonBody(request, maxBytes);
  return schema.parse(json);
}
