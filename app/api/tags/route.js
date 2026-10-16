import { createTag } from "@/lib/application/tags/create-tag";
import { listTags } from "@/lib/application/tags/list-tags";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { createTagBodySchema } from "@/lib/validation/tag-api-schemas";

export async function GET(request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const session = await requireApiSession(request);
    const tags = await listTags(session.user.id);

    return Response.json(
      { tags },
      { headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}

export async function POST(request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const session = await requireApiSession(request);
    const ip = getClientIp(request);

    await consumeRateLimit({
      key: `tags-write:${session.user.id}:${ip}`,
      windowSeconds: 60,
      max: 40,
    });

    const body = await parseJsonBody(request, createTagBodySchema, 8_192);
    const tag = await createTag(session.user.id, body);

    return Response.json(
      { tag },
      { status: 201, headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
