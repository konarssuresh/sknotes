"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/logging/report-client-error";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
    reportClientError({
      message: error?.message ?? "Unknown client error",
      digest: error?.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-title-lg text-foreground font-semibold">
        Something went wrong
      </h1>
      <p className="text-body-sm text-muted-foreground max-w-md">
        An unexpected error occurred. You can try again.
      </p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
