"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import "./globals.css";
import { reportClientError } from "@/lib/logging/report-client-error";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
    reportClientError({
      message: error?.message ?? "Unknown global error",
      digest: error?.digest,
    });
  }, [error]);

  const isServerError = Boolean(error?.digest);
  const detail = isServerError
    ? "A server error occurred. Reload to try again."
    : "Reload to try again, or go back. If this keeps happening, clear browsing data for this site (cache and cookies) or sign out to reset offline caches.";

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <h1 className="text-title-lg font-semibold">This page couldn&apos;t load</h1>
          <p className="text-body-sm text-muted-foreground max-w-md">{detail}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button type="button" onClick={() => reset()}>
              Reload
            </Button>
            {!isServerError ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = "/";
                  }
                }}
              >
                Back
              </Button>
            ) : null}
          </div>
        </div>
      </body>
    </html>
  );
}
