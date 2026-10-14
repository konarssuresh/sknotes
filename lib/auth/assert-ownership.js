import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

/**
 * @param {{ userId?: string } | null | undefined} resource
 * @param {string} sessionUserId
 */
export function assertResourceOwnership(resource, sessionUserId) {
  if (!resource || resource.userId !== sessionUserId) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Resource not found", 404);
  }
}
