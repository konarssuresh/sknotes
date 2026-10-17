"use client";

import { getLastApiRequestId } from "@/lib/logging/last-api-request-id";

/**
 * Fire-and-forget client error report (no note content, tokens, or cookies).
 * @param {{ message: string; digest?: string; route?: string }} payload
 */
export function reportClientError(payload) {
  if (typeof window === "undefined") {
    return;
  }

  const body = {
    route: payload.route ?? window.location.pathname,
    message: payload.message.slice(0, 500),
    digest: payload.digest,
    lastApiRequestId: getLastApiRequestId() ?? undefined,
    swVersion: readSwVersion(),
    buildId: readBuildId(),
  };

  void fetch("/api/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // ignore reporting failures
  });
}

function readMetaContent(name) {
  try {
    return (
      document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ??
      undefined
    );
  } catch {
    return undefined;
  }
}

function readSwVersion() {
  return readMetaContent("sknotes-sw-version");
}

function readBuildId() {
  return (
    readMetaContent("sknotes-build-id") ??
    process.env.NEXT_PUBLIC_BUILD_ID ??
    undefined
  );
}
