/**
 * @param {Response} response
 */
async function parseApiResponse(response) {
  if (response.ok) {
    const data = await response.json();
    return { ok: true, data };
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
    error: body?.error ?? { message: "Request failed" },
  };
}

export async function fetchTags() {
  const response = await fetch("/api/tags");
  const result = await parseApiResponse(response);
  if (!result.ok) {
    throw Object.assign(new Error(result.error.message), {
      apiError: result.error,
      status: result.status,
    });
  }
  return result.data.tags;
}

/**
 * @param {{ name: string }} payload
 */
export async function createTagRequest(payload) {
  const response = await fetch("/api/tags", {
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
  return result.data.tag;
}

/**
 * @param {string} tagId
 * @param {{ name: string }} payload
 */
export async function renameTagRequest(tagId, payload) {
  const response = await fetch(`/api/tags/${tagId}`, {
    method: "PATCH",
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
  return result.data.tag;
}

/**
 * @param {string} tagId
 */
export async function deleteTagRequest(tagId) {
  const response = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
  if (response.status === 204) {
    return;
  }
  const result = await parseApiResponse(response);
  throw Object.assign(new Error(result.error?.message ?? "Request failed"), {
    apiError: result.error,
    status: result.status,
  });
}
