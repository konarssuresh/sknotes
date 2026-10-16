import "server-only";

import { normalizeTagName } from "@/lib/domain/normalize-tag-name";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";
import { toTagDto } from "@/lib/notes/tag-dto";
import {
  findTagByNormalizedName,
  insertTag,
} from "@/lib/repositories/tags-repository";

/**
 * @param {string} userId
 * @param {{ name: string }} input
 */
export async function createTag(userId, input) {
  const name = input.name.trim();
  const normalizedName = normalizeTagName(name);
  if (!normalizedName) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "Tag name is required",
      400
    );
  }

  const existing = await findTagByNormalizedName(userId, normalizedName);
  if (existing) {
    throw new ApiError(
      ErrorCodes.CONFLICT,
      "A tag with this name already exists.",
      409,
      { reason: "DUPLICATE_TAG" }
    );
  }

  const tag = await insertTag(userId, { name, normalizedName });
  return toTagDto(tag, 0);
}
