"use client";

import Link from "next/link";
import { Pin } from "lucide-react";

import { cn } from "@/lib/utils";

function formatRelativeTime(iso) {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return date.toLocaleDateString();
}

function displayTitle(note) {
  const t = (note.title ?? "").trim();
  return t || "Untitled";
}

/**
 * @param {{
 *   note: {
 *     id: string;
 *     title?: string;
 *     plainText?: string;
 *     pinned?: boolean;
 *     updatedAt?: string;
 *     status?: string;
 *   };
 *   href: string;
 *   tagNames?: string[];
 * }} props
 */
export function NoteCard({ note, href, tagNames = [] }) {
  const preview = (note.plainText ?? "").trim().slice(0, 160);
  const visibleTags = tagNames.slice(0, 3);
  const overflow = tagNames.length - visibleTags.length;

  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-muted/40 block py-4 transition-colors",
        note.status === "trashed" && "opacity-80"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-title truncate font-medium">
              {displayTitle(note)}
            </span>
            {note.status === "archived" ? (
              <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium uppercase">
                Archived
              </span>
            ) : null}
          </div>
          {preview ? (
            <p className="text-body-sm text-muted-foreground mt-1 line-clamp-2">
              {preview}
            </p>
          ) : null}
          {visibleTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {visibleTags.map((name) => (
                <span
                  key={name}
                  className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                >
                  {name}
                </span>
              ))}
              {overflow > 0 ? (
                <span className="text-muted-foreground text-xs">
                  +{overflow}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {note.pinned ? (
            <Pin className="text-pin-active size-4" aria-label="Pinned" />
          ) : null}
          <span className="text-caption text-muted-foreground">
            {formatRelativeTime(note.updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
