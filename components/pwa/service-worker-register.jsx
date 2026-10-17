"use client";

import { useEffect } from "react";

import { reportClientError } from "@/lib/logging/report-client-error";
import {
  clearServiceWorkerReloadFlag,
  registerProductionServiceWorker,
} from "@/lib/pwa/register-service-worker";

function shouldRegisterServiceWorker() {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return process.env.NEXT_PUBLIC_E2E_PWA === "1";
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    clearServiceWorkerReloadFlag();

    if (!shouldRegisterServiceWorker()) {
      return;
    }

    void registerProductionServiceWorker().catch((error) => {
      console.error("[pwa] service worker registration failed", error);
      reportClientError({
        message:
          error instanceof Error
            ? error.message
            : "Service worker registration failed",
      });
    });
  }, []);

  return null;
}
