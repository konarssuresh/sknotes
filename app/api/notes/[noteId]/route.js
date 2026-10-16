import { deleteNotePermanently } from "@/lib/application/notes/delete-note";
import { getNote } from "@/lib/application/notes/get-note";
import { updateNote } from "@/lib/application/notes/update-note";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { NOTE_API_MAX_BYTES } from "@/lib/notes/api-constants";
import { updateNoteBodySchema } from "@/lib/validation/note-api-schemas";

export async function GET(request, context) {
  const requestId = getOrCreateRequestId(request);
  const { noteId } = await context.params;

  try {
    const session = await requireApiSession(request);
    const note = await getNote(session.user.id, noteId);

    return Response.json(
      { note },
      { headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}

export async function PATCH(request, context) {
  const requestId = getOrCreateRequestId(request);
  const { noteId } = await context.params;

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
      updateNoteBodySchema,
      NOTE_API_MAX_BYTES
    );

    const note = await updateNote(session.user.id, noteId, body);

    return Response.json(
      { note },
      { headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}

export async function DELETE(request, context) {
  const requestId = getOrCreateRequestId(request);
  const { noteId } = await context.params;

  try {
    const session = await requireApiSession(request);
    const ip = getClientIp(request);

    await consumeRateLimit({
      key: `notes-delete:${session.user.id}:${ip}`,
      windowSeconds: 60,
      max: 30,
    });

    await deleteNotePermanently(session.user.id, noteId);

    return new Response(null, {
      status: 204,
      headers: { [REQUEST_ID_HEADER]: requestId },
    });
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
