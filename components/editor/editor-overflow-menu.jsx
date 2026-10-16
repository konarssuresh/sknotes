"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { Button } from "@/components/ui/button";

/**
 * @param {{
 *   pinned: boolean;
 *   status: string;
 *   onPinToggle: () => void;
 *   onTags: () => void;
 *   onArchive: () => void;
 *   onUnarchive: () => void;
 *   onTrash: () => void;
 *   onExportMarkdown: () => void;
 *   onExportText: () => void;
 * }} props
 */
export function EditorOverflowMenu({
  pinned,
  status,
  onPinToggle,
  onTags,
  onArchive,
  onUnarchive,
  onTrash,
  onExportMarkdown,
  onExportText,
}) {
  const [open, setOpen] = useState(false);
  const [trashConfirm, setTrashConfirm] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Note actions"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="size-5" />
      </Button>
      {open ? (
        <div
          className="border-border bg-popover absolute top-12 right-0 z-20 min-w-44 rounded-lg border p-1 shadow-lg"
          role="menu"
        >
          <button
            type="button"
            className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
            onClick={() => {
              onPinToggle();
              setOpen(false);
            }}
          >
            {pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
            onClick={() => {
              onTags();
              setOpen(false);
            }}
          >
            Tags
          </button>
          {status === "archived" ? (
            <button
              type="button"
              className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
              onClick={() => {
                onUnarchive();
                setOpen(false);
              }}
            >
              Unarchive
            </button>
          ) : (
            <button
              type="button"
              className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
              onClick={() => {
                onArchive();
                setOpen(false);
              }}
            >
              Archive
            </button>
          )}
          <button
            type="button"
            className="hover:bg-muted text-destructive w-full rounded-md px-3 py-2 text-left text-sm"
            onClick={() => {
              setTrashConfirm(true);
              setOpen(false);
            }}
          >
            Move to Trash
          </button>
          <button
            type="button"
            className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
            onClick={() => {
              onExportMarkdown();
              setOpen(false);
            }}
          >
            Export Markdown
          </button>
          <button
            type="button"
            className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm"
            onClick={() => {
              onExportText();
              setOpen(false);
            }}
          >
            Export plain text
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={trashConfirm}
        title="Move to Trash?"
        description="You can restore this note from Trash later."
        confirmLabel="Move to Trash"
        destructive
        onCancel={() => setTrashConfirm(false)}
        onConfirm={() => {
          setTrashConfirm(false);
          onTrash();
        }}
      />
    </>
  );
}
