import { setLastApiRequestId } from "@/lib/logging/last-api-request-id";

/**
 * @param {Response} response
 */
async function parseApiResponse(response) {
  const requestId = response.headers.get("x-request-id");
  setLastApiRequestId(requestId);
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

/**
 * @param {{
 *   status?: string;
 *   limit?: number;
 *   cursor?: string | null;
 *   tagId?: string | null;
 *   pinned?: boolean | null;
 * }} params
 */
export async function fetchNotesPage(params = {}) {
  const {
    status = "active",
    limit = 30,
    cursor = null,
    tagId = null,
    pinned = null,
  } = params;
  const searchParams = new URLSearchParams({
    status,
    limit: String(limit),
  });
  if (cursor) {
    searchParams.set("cursor", cursor);
  }
  if (tagId) {
    searchParams.set("tagId", tagId);
  }
  if (pinned === true) {
    searchParams.set("pinned", "true");
  }
  const response = await fetch(`/api/notes?${searchParams}`);
  const result = await parseApiResponse(response);
  if (!result.ok) {
    throw Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
  }
  return result.data;
}

/** @deprecated Use fetchNotesPage */
export async function fetchNotesList(params = {}) {
  const page = await fetchNotesPage(params);
  return page.notes;
}

/**
 * @param {{
 *   q?: string;
 *   status?: string;
 *   tagId?: string | null;
 *   cursor?: string | null;
 *   limit?: number;
 * }} params
 */
export async function searchNotesPage(params = {}) {
  const {
    q = "",
    status = "active",
    tagId = null,
    cursor = null,
    limit = 30,
  } = params;
  const searchParams = new URLSearchParams({
    q,
    status,
    limit: String(limit),
  });
  if (tagId) {
    searchParams.set("tagId", tagId);
  }
  if (cursor) {
    searchParams.set("cursor", cursor);
  }
  const response = await fetch(`/api/search?${searchParams}`);
  const result = await parseApiResponse(response);
  if (!result.ok) {
    throw Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
  }
  return result.data;
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
 * @param {Record<string, unknown>} payload
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

/**
 * @param {string} noteId
 */
export async function deleteNotePermanentlyRequest(noteId) {
  const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
  if (response.status === 204) {
    return;
  }
  const result = await parseApiResponse(response);
  throw Object.assign(new Error(result.error?.message ?? "Request failed"), {
    apiError: result.error,
    status: result.status,
  });
}

/**
 * @param {string} noteId
 * @param {"markdown" | "text"} format
 */
export async function downloadNoteExport(noteId, format) {
  const response = await fetch(`/api/notes/${noteId}/export?format=${format}`);
  if (!response.ok) {
    const result = await parseApiResponse(response);
    throw Object.assign(new Error(result.error?.message ?? "Export failed"), {
      apiError: result.error,
      status: result.status,
    });
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `note.${format === "markdown" ? "md" : "txt"}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
