import { auth } from "@/lib/auth/auth";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { deleteAccountSchema } from "@/lib/validation/auth-schemas";

export async function DELETE(request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const session = await requireApiSession(request);
    const ip = getClientIp(request);

    await consumeRateLimit({
      key: `account-delete:${session.user.id}:${ip}`,
      windowSeconds: 3600,
      max: 3,
    });

    const body = await parseJsonBody(request, deleteAccountSchema, 65_536);

    await auth.api.deleteUser({
      headers: request.headers,
      body: body.password ? { password: body.password } : {},
    });

    return new Response(null, {
      status: 204,
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
