"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ConflictDialog } from "@/components/editor/conflict-dialog";
import { LeaveDialog } from "@/components/editor/leave-dialog";
import { NoteLexicalEditor } from "@/components/editor/note-lexical-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createNoteRequest,
  fetchNote,
  updateNoteRequest,
} from "@/features/notes/note-api";
import { noteKeys } from "@/features/notes/query-keys";
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
  editorKey: initialEditorKey,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverNoteId, setServerNoteId] = useState(initialServerNoteId);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(initialRevision);
  const [editorKey, setEditorKey] = useState(initialEditorKey);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [serverConflictNote, setServerConflictNote] = useState(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingLeave = useRef(null);
  const markSavedRef = useRef(null);
  const autosavePaused = conflictOpen;

  const persistRecovery = useCallback(() => {
    writeRecoveryDraft(userId, draftKey, {
      title,
      content,
      savedAt: new Date().toISOString(),
    });
  }, [userId, draftKey, title, content]);

  const getPayload = useCallback(() => {
    if (autosavePaused) {
      return null;
    }
    if (!hasMeaningfulContent({ title, content })) {
      return null;
    }
    const fp = fingerprintNote(title, content);
    return {
      fingerprint: fp,
      title,
      content,
      revision,
      serverNoteId,
    };
  }, [autosavePaused, title, content, revision, serverNoteId]);

  const save = useCallback(
    async (payload) => {
      persistRecovery();
      const { title: t, content: c, revision: rev, serverNoteId: id } = payload;

      if (!id) {
        const created = await createNoteRequest({ title: t, content: c });
        setServerNoteId(created.id);
        setRevision(created.revision);
        clearRecoveryDraft(userId, "new");
        writeRecoveryDraft(userId, created.id, {
          title: t,
          content: c,
          savedAt: new Date().toISOString(),
        });
        queryClient.setQueryData(noteKeys.detail(created.id), created);
        queryClient.invalidateQueries({ queryKey: noteKeys.list() });
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
        setRevision(updated.revision);
        queryClient.setQueryData(noteKeys.detail(id), updated);
        queryClient.invalidateQueries({ queryKey: noteKeys.list() });
        clearRecoveryDraft(userId, id);
        markSavedRef.current?.(payload.fingerprint);
      } catch (err) {
        if (err.isConflict && err.conflictDetails?.serverNote) {
          setServerConflictNote(err.conflictDetails.serverNote);
          setConflictOpen(true);
        }
        throw err;
      }
    },
    [persistRecovery, queryClient, router, userId]
  );

  const autosave = useAutosave({
    enabled: !autosavePaused,
    getPayload,
    save,
    onSchedule: persistRecovery,
  });

  useEffect(() => {
    markSavedRef.current = autosave.markSaved;
  }, [autosave.markSaved]);

  useEffect(() => {
    autosave.resetBaseline(fingerprintNote(initialTitle, initialContent));
  }, [autosave, initialTitle, initialContent]);

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
    setTitle(value);
    autosave.schedule();
    persistRecovery();
  };

  const handleContentChange = (value) => {
    setContent(value);
    autosave.schedule();
    persistRecovery();
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
    setTitle(serverConflictNote.title ?? "");
    setContent(serverConflictNote.content ?? createEmptyLexicalContent());
    setRevision(serverConflictNote.revision);
    setEditorKey(
      `editor-${serverConflictNote.id}-server-${serverConflictNote.revision}`
    );
    autosave.resetBaseline(
      fingerprintNote(serverConflictNote.title, serverConflictNote.content)
    );
    setConflictOpen(false);
    setServerConflictNote(null);
  };

  const resolveKeepMine = async () => {
    if (!serverConflictNote || !serverNoteId) {
      return;
    }
    const fp = fingerprintNote(title, content);
    try {
      const updated = await updateNoteRequest(serverNoteId, {
        expectedRevision: serverConflictNote.revision,
        title,
        content,
      });
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
    <div className="mx-auto w-full max-w-(--content-max)">
      <header className="mb-4 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
          ← Back
        </Button>
        <div aria-live="polite" className="min-w-[6rem] text-center">
          <SaveStatus status={autosave.status} onRetry={autosave.retry} />
        </div>
        <span className="w-12" aria-hidden />
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

  return (
    <NoteEditorClient
      key={loadedNote.id}
      userId={userId}
      draftKey={loadedNote.id}
      initialTitle={loadedNote.title ?? ""}
      initialContent={loadedNote.content ?? createEmptyLexicalContent()}
      initialRevision={loadedNote.revision}
      initialServerNoteId={loadedNote.id}
      editorKey={`editor-${loadedNote.id}-${loadedNote.revision}`}
    />
  );
}
