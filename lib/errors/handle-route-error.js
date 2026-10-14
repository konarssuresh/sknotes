import { ZodError } from "zod";

import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { redactForLog } from "@/lib/logging/request-context";

/**
 * @param {unknown} error
 * @param {string} requestId
 */
export function handleRouteError(error, requestId) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      },
      { status: error.status, headers: { "x-request-id": requestId } }
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "Validation failed",
          details: { issues: error.issues },
          requestId,
        },
      },
      { status: 400, headers: { "x-request-id": requestId } }
    );
  }

  console.error("[api] unexpected error", {
    requestId,
    error: error instanceof Error ? error.message : "unknown",
    meta: redactForLog(
      error instanceof Error ? { name: error.name } : { type: "unknown" }
    ),
  });

  return Response.json(
    {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Something went wrong. Please try again later.",
        requestId,
      },
    },
    { status: 500, headers: { "x-request-id": requestId } }
  );
}
