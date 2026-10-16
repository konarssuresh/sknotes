import { searchNotes } from "@/lib/application/notes/search-notes";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { searchNotesQuerySchema } from "@/lib/validation/search-api-schemas";

export async function GET(request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const session = await requireApiSession(request);
    const ip = getClientIp(request);

    await consumeRateLimit({
      key: `search:${session.user.id}:${ip}`,
      windowSeconds: 60,
      max: 120,
    });

    const url = new URL(request.url);
    const query = searchNotesQuerySchema.parse({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? undefined,
      tagId: url.searchParams.get("tagId"),
      cursor: url.searchParams.get("cursor"),
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const page = await searchNotes(session.user.id, query);

    return Response.json(page, {
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
