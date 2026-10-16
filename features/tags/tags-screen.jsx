"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { AnimatedOverlay } from "@/components/motion/animated-presence";
import { RhfField } from "@/components/forms/rhf-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { invalidateNoteListCaches } from "@/features/notes/note-cache";
import { tagKeys } from "@/features/notes/query-keys";
import {
  createTagRequest,
  deleteTagRequest,
  fetchTags,
  renameTagRequest,
} from "@/features/tags/tag-api";

const tagNameSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(100),
});

function TagFormDialog({ open, title, defaultName, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(tagNameSchema),
    defaultValues: { name: defaultName ?? "" },
  });

  if (!open) {
    return null;
  }

  return (
    <AnimatedOverlay
      open={open}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <FormProvider {...form}>
        <form
          className="bg-popover border-border w-full max-w-md rounded-lg border p-6 shadow-lg"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values.name);
            onClose();
          })}
        >
          <h2 className="text-title font-semibold">{title}</h2>
          <div className="mt-4">
            <RhfField
              name="name"
              label="Tag name"
              render={({ field, fieldId, describedBy, invalid }) => (
                <TextField
                  id={fieldId}
                  describedBy={describedBy}
                  invalid={invalid}
                  {...field}
                />
              )}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </FormProvider>
    </AnimatedOverlay>
  );
}

export function TagsScreen() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    data: tags = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: tagKeys.list(),
    queryFn: fetchTags,
  });

  const createMutation = useMutation({
    mutationFn: createTagRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }) => renameTagRequest(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      invalidateNoteListCaches(queryClient);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTagRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      invalidateNoteListCaches(queryClient);
    },
  });

  return (
    <div className="mx-auto w-full max-w-(--list-max) space-y-6">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-title font-semibold">Tags</h1>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          New tag
        </Button>
      </header>
      {isLoading ? (
        <p className="text-muted-foreground">Loading tags…</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-destructive">Could not load tags.</p>
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : tags.length === 0 ? (
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">No tags yet.</p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create tag
          </Button>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between gap-2 py-3"
            >
              <Link
                href={`/notes?tagId=${tag.id}`}
                className="min-w-0 flex-1 hover:underline"
              >
                <span className="font-medium">{tag.name}</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  {tag.noteCount === 0 ? "Unused" : `${tag.noteCount} notes`}
                </span>
              </Link>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRenameTarget(tag)}
                >
                  Rename
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(tag)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {createOpen ? (
        <TagFormDialog
          open={createOpen}
          title="New tag"
          onClose={() => setCreateOpen(false)}
          onSubmit={(name) => createMutation.mutateAsync({ name })}
        />
      ) : null}
      {renameTarget ? (
        <TagFormDialog
          open={Boolean(renameTarget)}
          title="Rename tag"
          defaultName={renameTarget.name}
          onClose={() => setRenameTarget(null)}
          onSubmit={(name) =>
            renameMutation.mutateAsync({ id: renameTarget.id, name })
          }
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this tag?"
        description={
          deleteTarget && deleteTarget.noteCount > 0
            ? `This removes the tag from ${deleteTarget.noteCount} notes.`
            : "This tag is unused and will be removed."
        }
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            void deleteMutation.mutateAsync(deleteTarget.id).then(() => {
              setDeleteTarget(null);
            });
          }
        }}
      />
    </div>
  );
}
