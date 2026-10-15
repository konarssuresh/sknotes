import { exportNote } from "@/lib/application/notes/export-note";
import { requireApiSession } from "@/lib/auth/require-api-session";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import {
  getOrCreateRequestId,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { exportNoteQuerySchema } from "@/lib/validation/note-api-schemas";

export async function GET(request, context) {
  const requestId = getOrCreateRequestId(request);
  const { noteId } = await context.params;

  try {
    const session = await requireApiSession(request);
    const url = new URL(request.url);
    const query = exportNoteQuerySchema.parse({
      format: url.searchParams.get("format"),
    });

    const exported = await exportNote(session.user.id, noteId, query.format);

    return new Response(exported.body, {
      status: 200,
      headers: {
        [REQUEST_ID_HEADER]: requestId,
        "Content-Type": exported.mime,
        "Content-Disposition": `attachment; filename="${exported.filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
