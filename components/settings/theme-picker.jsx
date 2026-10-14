"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { THEME_MODES } from "@/lib/theme/constants";
import { cn } from "@/lib/utils";

const labels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function subscribe() {
  return () => {};
}

export function ThemePicker() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="bg-muted h-11 w-full max-w-sm rounded-lg" aria-hidden />
    );
  }

  const active = theme ?? "system";

  return (
    <div className="flex flex-col gap-2">
      <div
        className="border-border bg-card inline-flex w-full max-w-sm rounded-lg border p-1"
        role="group"
        aria-label="Theme"
      >
        {THEME_MODES.map((mode) => (
          <Button
            key={mode}
            type="button"
            variant={active === mode ? "default" : "ghost"}
            size="sm"
            className={cn("flex-1")}
            aria-pressed={active === mode}
            onClick={() => setTheme(mode)}
          >
            {labels[mode]}
          </Button>
        ))}
      </div>
      <p className="text-caption text-muted-foreground">
        Currently using {resolvedTheme === "dark" ? "dark" : "light"} appearance
        {active === "system" ? " (system)" : ""}.
      </p>
    </div>
  );
}
