/**
 * @typedef {import('@/lib/notes/note-dto').toNoteDto} NoteDto
 */

/**
 * @param {Response} response
 */
async function parseApiResponse(response) {
  const requestId = response.headers.get("x-request-id");
  if (response.ok) {
    const data = await response.json();
    return { ok: true, data, requestId };
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    ok: false,
    status: response.status,
    error: body?.error ?? {
      code: "INTERNAL_ERROR",
      message: "Request failed",
      requestId,
    },
    requestId,
  };
}

export async function fetchNotesList({ status = "active", limit = 30 } = {}) {
  const params = new URLSearchParams({ status, limit: String(limit) });
  const response = await fetch(`/api/notes?${params}`);
  const result = await parseApiResponse(response);
  if (!result.ok) {
    throw Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
  }
  return result.data.notes;
}

/**
 * @param {string} noteId
 */
export async function fetchNote(noteId) {
  const response = await fetch(`/api/notes/${noteId}`);
  const result = await parseApiResponse(response);
  if (!result.ok) {
    throw Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
  }
  return result.data.note;
}

/**
 * @param {{ title: string; content: unknown; forceCreate?: boolean }} payload
 */
export async function createNoteRequest(payload) {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await parseApiResponse(response);
  if (!result.ok) {
    throw Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
  }
  return result.data.note;
}

/**
 * @param {string} noteId
 * @param {{ expectedRevision: number; title: string; content: unknown }} payload
 */
export async function updateNoteRequest(noteId, payload) {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await parseApiResponse(response);
  if (!result.ok) {
    const err = Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
    if (result.status === 409) {
      err.isConflict = true;
      err.conflictDetails = result.error.details;
    }
    throw err;
  }
  return result.data.note;
}
