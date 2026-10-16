import "server-only";

import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { deleteTagForUser } from "@/lib/repositories/tags-repository";

/**
 * @param {string} userId
 * @param {string} tagId
 */
export async function deleteTag(userId, tagId) {
  const result = await deleteTagForUser(userId, tagId);
  if (!result.ok) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Tag not found", 404);
  }
}
