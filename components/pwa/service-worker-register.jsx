"use client";

import { useEffect } from "react";

function shouldRegisterServiceWorker() {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return process.env.NEXT_PUBLIC_E2E_PWA === "1";
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (!shouldRegisterServiceWorker()) {
      return;
    }
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }, []);

  return null;
}
