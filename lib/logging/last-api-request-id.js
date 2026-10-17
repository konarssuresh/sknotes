let lastApiRequestId = null;

export function setLastApiRequestId(requestId) {
  if (requestId && typeof requestId === "string") {
    lastApiRequestId = requestId.slice(0, 128);
  }
}

export function getLastApiRequestId() {
  return lastApiRequestId;
}

/** @internal */
export function resetLastApiRequestIdForTests() {
  lastApiRequestId = null;
}
