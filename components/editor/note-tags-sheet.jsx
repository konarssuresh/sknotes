"use client";

import { useQuery } from "@tanstack/react-query";

import { ModalShell } from "@/components/a11y/modal-shell";
import { Button } from "@/components/ui/button";
import { tagKeys } from "@/features/notes/query-keys";
import { fetchTags } from "@/features/tags/tag-api";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   open: boolean;
 *   selectedIds: string[];
 *   onClose: () => void;
 *   onChange: (tagIds: string[]) => void;
 * }} props
 */
export function NoteTagsSheet({ open, selectedIds, onClose, onChange }) {
  const { data: tags = [] } = useQuery({
    queryKey: tagKeys.list(),
    queryFn: fetchTags,
    enabled: open,
  });

  if (!open) {
    return null;
  }

  const toggle = (tagId) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  return (
    <ModalShell
      open={open}
      titleId="tags-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
    >
      <div className="bg-popover border-border w-full max-w-md rounded-t-lg border p-6 shadow-lg sm:rounded-lg">
        <h2 id="tags-sheet-title" className="text-title font-semibold">
          Tags
        </h2>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {tags.length === 0 ? (
            <li className="text-muted-foreground text-sm">
              No tags yet. Create tags from the Tags screen.
            </li>
          ) : (
            tags.map((tag) => {
              const active = selectedIds.includes(tag.id);
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm",
                      active ? "bg-accent text-primary" : "hover:bg-muted"
                    )}
                    onClick={() => toggle(tag.id)}
                  >
                    {tag.name}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
