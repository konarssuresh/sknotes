import { deleteTag } from "@/lib/application/tags/delete-tag";
import { renameTag } from "@/lib/application/tags/rename-tag";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { renameTagBodySchema } from "@/lib/validation/tag-api-schemas";

export async function PATCH(request, context) {
  const requestId = getOrCreateRequestId(request);
  const { tagId } = await context.params;

  try {
    const session = await requireApiSession(request);
    const ip = getClientIp(request);

    await consumeRateLimit({
      key: `tags-write:${session.user.id}:${ip}`,
      windowSeconds: 60,
      max: 40,
    });

    const body = await parseJsonBody(request, renameTagBodySchema, 8_192);
    const tag = await renameTag(session.user.id, tagId, body);

    return Response.json(
      { tag },
      { headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}

export async function DELETE(request, context) {
  const requestId = getOrCreateRequestId(request);
  const { tagId } = await context.params;

  try {
    const session = await requireApiSession(request);
    const ip = getClientIp(request);

    await consumeRateLimit({
      key: `tags-write:${session.user.id}:${ip}`,
      windowSeconds: 60,
      max: 40,
    });

    await deleteTag(session.user.id, tagId);

    return new Response(null, {
      status: 204,
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
