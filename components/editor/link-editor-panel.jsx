"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * @param {{
 *   linkText: string;
 *   linkUrl: string;
 *   urlError: string;
 *   textError: string;
 *   onLinkTextChange: (value: string) => void;
 *   onLinkUrlChange: (value: string) => void;
 *   onSubmit: () => void;
 *   onCancel: () => void;
 * }} props
 */
export function LinkEditorPanel({
  linkText,
  linkUrl,
  urlError,
  textError,
  onLinkTextChange,
  onLinkUrlChange,
  onSubmit,
  onCancel,
}) {
  const textRef = useRef(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <form
      className="border-border bg-muted/30 flex w-full flex-col gap-3 rounded-lg border p-3 pt-2 sm:flex-row sm:flex-wrap sm:items-end"
      role="dialog"
      aria-labelledby="link-editor-title"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p id="link-editor-title" className="sr-only">
        Insert or edit link
      </p>
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor="link-editor-text">Link text</Label>
        <Input
          ref={textRef}
          id="link-editor-text"
          value={linkText}
          onChange={(event) => onLinkTextChange(event.target.value)}
          placeholder="Visible text"
          aria-invalid={Boolean(textError)}
          aria-describedby={textError ? "link-text-error" : undefined}
        />
        {textError ? (
          <p id="link-text-error" className="text-destructive text-caption">
            {textError}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor="link-editor-url">URL</Label>
        <Input
          id="link-editor-url"
          value={linkUrl}
          onChange={(event) => onLinkUrlChange(event.target.value)}
          placeholder="https://"
          aria-invalid={Boolean(urlError)}
          aria-describedby={urlError ? "link-url-error" : undefined}
        />
        {urlError ? (
          <p id="link-url-error" className="text-destructive text-caption">
            {urlError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          Add link
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
