import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

/** @type {Record<string, string[]>} */
const ALLOWED_TRANSITIONS = {
  active: ["active", "archived", "trashed"],
  archived: ["active", "archived", "trashed"],
  trashed: ["active", "trashed"],
};

/**
 * @param {string} from
 * @param {string} to
 */
export function assertValidStatusTransition(from, to) {
  if (from === to) {
    return;
  }
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new ApiError(
      ErrorCodes.FORBIDDEN,
      "This status change is not allowed.",
      403,
      { reason: "INVALID_STATUS_TRANSITION", from, to }
    );
  }
}
