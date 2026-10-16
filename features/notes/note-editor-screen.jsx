"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { EditorOverflowMenu } from "@/components/editor/editor-overflow-menu";
import { ConflictDialog } from "@/components/editor/conflict-dialog";
import { LeaveDialog } from "@/components/editor/leave-dialog";
import { NoteTagsSheet } from "@/components/editor/note-tags-sheet";
import { NoteLexicalEditor } from "@/components/editor/note-lexical-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invalidateNoteListCaches } from "@/features/notes/note-cache";
import {
  createNoteRequest,
  downloadNoteExport,
  fetchNote,
  updateNoteRequest,
} from "@/features/notes/note-api";
import { noteKeys } from "@/features/notes/query-keys";
import { TrashNoteScreen } from "@/features/notes/trash-note-screen";
import {
  clearRecoveryDraft,
  readRecoveryDraft,
  writeRecoveryDraft,
} from "@/features/notes/recovery-draft";
import { useAutosave } from "@/features/notes/use-autosave";
import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";
import { hasMeaningfulContent } from "@/lib/domain/notes/meaningful-content";

function fingerprintNote(title, content) {
  return JSON.stringify({ title, content });
}

function SaveStatus({ status, onRetry }) {
  if (status === "saving" || status === "pending") {
    return <span className="text-caption text-muted-foreground">Saving…</span>;
  }
  if (status === "saved") {
    return <span className="text-caption text-muted-foreground">Saved</span>;
  }
  if (status === "error") {
    return (
      <span className="text-caption flex items-center gap-2">
        <span className="text-destructive">Couldn&apos;t save</span>
        <Button type="button" variant="link" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </span>
    );
  }
  return null;
}

/**
 * @param {{
 *   userId: string;
 *   draftKey: string;
 *   initialTitle: string;
 *   initialContent: unknown;
 *   initialRevision: number;
 *   initialServerNoteId: string | null;
 *   initialPinned: boolean;
 *   initialStatus: string;
 *   initialTagIds: string[];
 *   editorKey: string;
 * }} props
 */
function NoteEditorClient({
  userId,
  draftKey,
  initialTitle,
  initialContent,
  initialRevision,
  initialServerNoteId,
  initialPinned,
  initialStatus,
  initialTagIds,
  editorKey: initialEditorKey,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverNoteId, setServerNoteId] = useState(initialServerNoteId);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(initialRevision);
  const [pinned, setPinned] = useState(initialPinned);
  const [status, setStatus] = useState(initialStatus);
  const [tagIds, setTagIds] = useState(initialTagIds);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(initialEditorKey);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [serverConflictNote, setServerConflictNote] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingLeave = useRef(null);
  const markSavedRef = useRef(null);
  const autosavePaused = conflictOpen;

  const draftRef = useRef({
    title: initialTitle,
    content: initialContent,
    revision: initialRevision,
    serverNoteId: initialServerNoteId,
  });

  const persistRecoveryFromRef = useCallback(() => {
    const { title: t, content: c } = draftRef.current;
    writeRecoveryDraft(userId, draftKey, {
      title: t,
      content: c,
      savedAt: new Date().toISOString(),
    });
  }, [userId, draftKey]);

  const getPayload = useCallback(() => {
    if (autosavePaused) {
      return null;
    }
    const {
      title: t,
      content: c,
      revision: rev,
      serverNoteId: id,
    } = draftRef.current;
    if (!hasMeaningfulContent({ title: t, content: c })) {
      return null;
    }
    const fp = fingerprintNote(t, c);
    return {
      fingerprint: fp,
      title: t,
      content: c,
      revision: rev,
      serverNoteId: id,
    };
  }, [autosavePaused]);

  const save = useCallback(
    async (payload) => {
      const { title: t, content: c, revision: rev, serverNoteId: id } = payload;

      if (!id) {
        const created = await createNoteRequest({ title: t, content: c });
        draftRef.current = {
          ...draftRef.current,
          serverNoteId: created.id,
          revision: created.revision,
        };
        setServerNoteId(created.id);
        setRevision(created.revision);
        const latestFp = fingerprintNote(
          draftRef.current.title,
          draftRef.current.content
        );
        if (latestFp === payload.fingerprint) {
          clearRecoveryDraft(userId, "new");
        }
        writeRecoveryDraft(userId, created.id, {
          title: draftRef.current.title,
          content: draftRef.current.content,
          savedAt: new Date().toISOString(),
        });
        queryClient.setQueryData(noteKeys.detail(created.id), created);
        invalidateNoteListCaches(queryClient);
        router.replace(`/notes/${created.id}`);
        markSavedRef.current?.(payload.fingerprint);
        return;
      }

      try {
        const updated = await updateNoteRequest(id, {
          expectedRevision: rev,
          title: t,
          content: c,
        });
        draftRef.current.revision = updated.revision;
        setRevision(updated.revision);
        queryClient.setQueryData(noteKeys.detail(id), updated);
        invalidateNoteListCaches(queryClient);
        const latestFp = fingerprintNote(
          draftRef.current.title,
          draftRef.current.content
        );
        if (latestFp === payload.fingerprint) {
          clearRecoveryDraft(userId, id);
        }
        markSavedRef.current?.(payload.fingerprint);
      } catch (err) {
        if (err.isConflict && err.conflictDetails?.serverNote) {
          setServerConflictNote(err.conflictDetails.serverNote);
          setConflictOpen(true);
        }
        throw err;
      }
    },
    [queryClient, router, userId]
  );

  const autosave = useAutosave({
    enabled: !autosavePaused,
    getPayload,
    save,
    onSchedule: persistRecoveryFromRef,
  });

  useEffect(() => {
    markSavedRef.current = autosave.markSaved;
  }, [autosave.markSaved]);

  const resetBaseline = autosave.resetBaseline;
  useEffect(() => {
    resetBaseline(fingerprintNote(initialTitle, initialContent));
  }, [resetBaseline, initialTitle, initialContent]);

  useEffect(() => {
    const handler = (event) => {
      if (autosave.needsNavigationGuard()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [autosave]);

  const handleTitleChange = (value) => {
    draftRef.current = { ...draftRef.current, title: value };
    setTitle(value);
    persistRecoveryFromRef();
    autosave.schedule();
  };

  const handleContentChange = (value) => {
    draftRef.current = { ...draftRef.current, content: value };
    setContent(value);
    persistRecoveryFromRef();
    autosave.schedule();
  };

  const handleBack = useCallback(async () => {
    if (!autosave.needsNavigationGuard()) {
      router.push("/notes");
      return;
    }
    try {
      await autosave.flush();
      if (!autosave.needsNavigationGuard()) {
        router.push("/notes");
        return;
      }
    } catch {
      // show dialog
    }
    pendingLeave.current = () => router.push("/notes");
    setLeaveOpen(true);
  }, [autosave, router]);

  const resolveKeepServer = () => {
    if (!serverConflictNote) {
      return;
    }
    const nextTitle = serverConflictNote.title ?? "";
    const nextContent =
      serverConflictNote.content ?? createEmptyLexicalContent();
    draftRef.current = {
      ...draftRef.current,
      title: nextTitle,
      content: nextContent,
      revision: serverConflictNote.revision,
    };
    setTitle(nextTitle);
    setContent(nextContent);
    setRevision(serverConflictNote.revision);
    setEditorKey(
      `editor-${serverConflictNote.id}-server-${serverConflictNote.revision}`
    );
    autosave.resetBaseline(fingerprintNote(nextTitle, nextContent));
    setConflictOpen(false);
    setServerConflictNote(null);
  };

  const applyMetaUpdate = useCallback(
    async (patch) => {
      if (!serverNoteId) {
        return null;
      }
      const updated = await updateNoteRequest(serverNoteId, {
        expectedRevision: draftRef.current.revision,
        ...patch,
      });
      draftRef.current.revision = updated.revision;
      setRevision(updated.revision);
      setPinned(updated.pinned);
      setStatus(updated.status);
      setTagIds(updated.tagIds ?? []);
      queryClient.setQueryData(noteKeys.detail(serverNoteId), updated);
      invalidateNoteListCaches(queryClient);
      return updated;
    },
    [queryClient, serverNoteId]
  );

  const resolveKeepMine = async () => {
    if (!serverConflictNote || !serverNoteId) {
      return;
    }
    const { title: t, content: c } = draftRef.current;
    const fp = fingerprintNote(t, c);
    try {
      const updated = await updateNoteRequest(serverNoteId, {
        expectedRevision: serverConflictNote.revision,
        title: t,
        content: c,
      });
      draftRef.current.revision = updated.revision;
      setRevision(updated.revision);
      setEditorKey(`editor-${serverNoteId}-mine-${updated.revision}`);
      autosave.resetBaseline(fp);
      autosave.markSaved(fp);
      queryClient.setQueryData(noteKeys.detail(serverNoteId), updated);
      setConflictOpen(false);
      setServerConflictNote(null);
    } catch (err) {
      if (err.isConflict && err.conflictDetails?.serverNote) {
        setServerConflictNote(err.conflictDetails.serverNote);
      }
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-(--content-max)">
      <header className="mb-4 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
          ← Back
        </Button>
        <div aria-live="polite" className="min-w-[6rem] text-center">
          <SaveStatus status={autosave.status} onRetry={autosave.retry} />
        </div>
        {serverNoteId ? (
          <EditorOverflowMenu
            pinned={pinned}
            status={status}
            onPinToggle={() => void applyMetaUpdate({ pinned: !pinned })}
            onTags={() => setTagsOpen(true)}
            onArchive={async () => {
              await applyMetaUpdate({ status: "archived" });
              router.push("/archive");
            }}
            onUnarchive={() => void applyMetaUpdate({ status: "active" })}
            onTrash={async () => {
              await applyMetaUpdate({ status: "trashed" });
              router.push("/trash");
            }}
            onExportMarkdown={() =>
              void downloadNoteExport(serverNoteId, "markdown")
            }
            onExportText={() => void downloadNoteExport(serverNoteId, "text")}
          />
        ) : (
          <span className="w-12" aria-hidden />
        )}
      </header>
      <Input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Title"
        className="text-title mb-4 border-0 bg-transparent px-0 font-semibold shadow-none focus-visible:ring-0"
        aria-label="Note title"
      />
      <NoteLexicalEditor
        editorKey={editorKey}
        initialContent={content}
        onChange={handleContentChange}
      />
      <NoteTagsSheet
        open={tagsOpen}
        selectedIds={tagIds}
        onClose={() => setTagsOpen(false)}
        onChange={(next) => {
          setTagIds(next);
          void applyMetaUpdate({ tagIds: next });
        }}
      />
      <ConflictDialog
        open={conflictOpen}
        onKeepMine={resolveKeepMine}
        onKeepServer={resolveKeepServer}
      />
      <LeaveDialog
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={() => {
          setLeaveOpen(false);
          pendingLeave.current?.();
        }}
      />
    </div>
  );
}

/**
 * @param {{ userId: string; noteId: string; isNew?: boolean }} props
 */
export function NoteEditorScreen({ userId, noteId, isNew = false }) {
  const {
    data: loadedNote,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: noteKeys.detail(noteId),
    queryFn: () => fetchNote(noteId),
    enabled: !isNew && Boolean(noteId),
  });

  if (isNew) {
    const recovery = readRecoveryDraft(userId, "new");
    return (
      <NoteEditorClient
        userId={userId}
        draftKey="new"
        initialTitle={recovery?.title ?? ""}
        initialContent={recovery?.content ?? createEmptyLexicalContent()}
        initialRevision={1}
        initialServerNoteId={null}
        editorKey={
          recovery ? `editor-recovery-new-${recovery.savedAt}` : "editor-new"
        }
        initialPinned={false}
        initialStatus="active"
        initialTagIds={[]}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-(--content-max)">
        <p className="text-muted-foreground">Loading note…</p>
      </div>
    );
  }

  if (isError || !loadedNote) {
    return (
      <div className="mx-auto w-full max-w-(--content-max) space-y-4">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load note"}
        </p>
        <div className="flex gap-2">
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
          <Link
            href="/notes"
            className="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm"
          >
            Back to notes
          </Link>
        </div>
      </div>
    );
  }

  if (loadedNote.status === "trashed") {
    return <TrashNoteScreen note={loadedNote} />;
  }

  return (
    <NoteEditorClient
      key={loadedNote.id}
      userId={userId}
      draftKey={loadedNote.id}
      initialTitle={loadedNote.title ?? ""}
      initialContent={loadedNote.content ?? createEmptyLexicalContent()}
      initialRevision={loadedNote.revision}
      initialServerNoteId={loadedNote.id}
      initialPinned={loadedNote.pinned}
      initialStatus={loadedNote.status}
      initialTagIds={loadedNote.tagIds ?? []}
      editorKey={`editor-${loadedNote.id}-${loadedNote.revision}`}
    />
  );
}
