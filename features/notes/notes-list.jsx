"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { fetchNotesList } from "@/features/notes/note-api";
import { noteKeys } from "@/features/notes/query-keys";

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

export function NotesList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: noteKeys.list("active"),
    queryFn: () => fetchNotesList({ status: "active", limit: 30 }),
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading notes…</p>;
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Could not load notes"}
        </p>
        <Button type="button" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const notes = data ?? [];

  if (notes.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          No notes yet. Create your first note.
        </p>
        <Link
          href="/notes/new"
          className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium"
        >
          Create note
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-border divide-y">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="hover:bg-muted/40 flex flex-col gap-1 px-1 py-3 transition-colors"
          >
            <span className="text-title font-semibold">
              {displayTitle(note)}
            </span>
            <span className="text-caption text-muted-foreground">
              {formatRelativeTime(note.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
