"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { Button } from "@/components/ui/button";
import { invalidateNoteListCaches } from "@/features/notes/note-cache";
import {
  deleteNotePermanentlyRequest,
  updateNoteRequest,
} from "@/features/notes/note-api";
import { noteKeys } from "@/features/notes/query-keys";

/**
 * @param {{
 *   note: {
 *     id: string;
 *     title?: string;
 *     plainText?: string;
 *     revision: number;
 *   };
 * }} props
 */
export function TrashNoteScreen({ note }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const title = (note.title ?? "").trim() || "Untitled";
  const body = (note.plainText ?? "").trim();

  const restore = async () => {
    setBusy(true);
    try {
      const updated = await updateNoteRequest(note.id, {
        expectedRevision: note.revision,
        status: "active",
      });
      queryClient.setQueryData(noteKeys.detail(note.id), updated);
      invalidateNoteListCaches(queryClient);
      router.push(`/notes/${note.id}`);
    } finally {
      setBusy(false);
    }
  };

  const deleteForever = async () => {
    setBusy(true);
    try {
      await deleteNotePermanentlyRequest(note.id);
      queryClient.removeQueries({ queryKey: noteKeys.detail(note.id) });
      invalidateNoteListCaches(queryClient);
      router.push("/trash");
    } finally {
      setBusy(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-(--content-max) space-y-6">
      <header className="flex items-center justify-between gap-2">
        <Link
          href="/trash"
          className="hover:bg-muted inline-flex h-7 items-center rounded-lg px-2 text-sm"
        >
          ← Back
        </Link>
        <span className="text-caption text-muted-foreground" aria-live="polite">
          Read-only
        </span>
      </header>
      <h1 className="text-title font-semibold">{title}</h1>
      <div
        className="text-body text-muted-foreground whitespace-pre-wrap"
        aria-readonly="true"
      >
        {body || "No content"}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={restore} disabled={busy}>
          Restore
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
          disabled={busy}
        >
          Delete forever
        </Button>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete this note permanently?"
        description="This can’t be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void deleteForever()}
      />
    </div>
  );
}
