import { createNote } from "@/lib/application/notes/create-note";
import { listNotes } from "@/lib/application/notes/list-notes";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { NOTE_API_MAX_BYTES } from "@/lib/notes/api-constants";
import {
  createNoteBodySchema,
  listNotesQuerySchema,
} from "@/lib/validation/note-api-schemas";

export async function GET(request) {
  const requestId = getOrCreateRequestId(request);

  try {
    const session = await requireApiSession(request);
    const url = new URL(request.url);
    const query = listNotesQuerySchema.parse({
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const notes = await listNotes(session.user.id, query);

    return Response.json(
      { notes },
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
      key: `notes-write:${session.user.id}:${ip}`,
      windowSeconds: 60,
      max: 60,
    });

    const body = await parseJsonBody(
      request,
      createNoteBodySchema,
      NOTE_API_MAX_BYTES
    );

    const note = await createNote(session.user.id, body);

    return Response.json(
      { note },
      { status: 201, headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
