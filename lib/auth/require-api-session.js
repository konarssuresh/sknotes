import { auth } from "@/lib/auth/auth";
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

  return session;
}
