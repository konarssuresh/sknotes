import "server-only";

import { normalizeTagName } from "@/lib/domain/normalize-tag-name";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { toTagDto } from "@/lib/notes/tag-dto";
import {
  findTagByNormalizedName,
  findTagForUser,
  listTagsWithNoteCounts,
  renameTagForUser,
} from "@/lib/repositories/tags-repository";

/**
 * @param {string} userId
 * @param {string} tagId
 * @param {{ name: string }} input
 */
export async function renameTag(userId, tagId, input) {
  const tag = await findTagForUser(userId, tagId);
  if (!tag) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Tag not found", 404);
  }

  const name = input.name.trim();
  const normalizedName = normalizeTagName(name);
  if (!normalizedName) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "Tag name is required",
      400
    );
  }

  const duplicate = await findTagByNormalizedName(userId, normalizedName);
  if (duplicate && duplicate._id.toString() !== tagId) {
    throw new ApiError(
      ErrorCodes.CONFLICT,
      "A tag with this name already exists.",
      409,
      { reason: "DUPLICATE_TAG" }
    );
  }

  const updated = await renameTagForUser(userId, tagId, {
    name,
    normalizedName,
  });
  if (!updated) {
    throw new ApiError(ErrorCodes.NOT_FOUND, "Tag not found", 404);
  }

  const rows = await listTagsWithNoteCounts(userId);
  const count =
    rows.find((row) => row.tag._id.toString() === tagId)?.noteCount ?? 0;
  return toTagDto(updated, count);
}
