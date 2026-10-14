import { auth } from "@/lib/auth/auth";
import { isEmailVerified } from "@/lib/auth/session";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

/**
 * @param {Request} request
 */
export async function requireApiSession(request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    throw new ApiError(ErrorCodes.UNAUTHORIZED, "Authentication required", 401);
  }

  if (!isEmailVerified(session.user)) {
    throw new ApiError(
      ErrorCodes.FORBIDDEN,
      "Verify your email before using this feature.",
      403,
      { reason: "EMAIL_NOT_VERIFIED" }
    );
  }

  return session;
}
