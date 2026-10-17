import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NoteEditorScreen } from "@/features/notes/note-editor-screen";
import {
  clearRecoveryDraft,
  readRecoveryDraft,
} from "@/features/notes/recovery-draft";
import { createEmptyLexicalContent } from "@/lib/domain/notes/defaults";

const NOTE_ID = "507f1f77bcf86cd799439011";
const USER_ID = "user-editor-test";

vi.mock("@/components/editor/note-lexical-editor", () => ({
  NoteLexicalEditor: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const fetchNote = vi.fn();
const updateNoteRequest = vi.fn();

vi.mock("@/features/notes/note-api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchNote: (...args) => fetchNote(...args),
    updateNoteRequest: (...args) => updateNoteRequest(...args),
  };
});

function renderEditor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NoteEditorScreen userId={USER_ID} noteId={NOTE_ID} />
    </QueryClientProvider>
  );
}

const baseNote = {
  id: NOTE_ID,
  title: "Hello",
  content: createEmptyLexicalContent(),
  revision: 1,
  status: "active",
};

describe("NoteEditorScreen autosave", () => {
  beforeEach(() => {
    fetchNote.mockResolvedValue(baseNote);
    updateNoteRequest.mockReset();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await clearRecoveryDraft(USER_ID, NOTE_ID);
  });

  async function mountEditor() {
    renderEditor();
    await waitFor(() => {
      expect(screen.getByLabelText("Note title")).toBeInTheDocument();
    });
    vi.useFakeTimers();
  }

  it("uses response revision and latest draft on follow-up save", async () => {
    let resolveFirst;
    updateNoteRequest
      .mockImplementationOnce(
        (_, body) =>
          new Promise((resolve) => {
            resolveFirst = () =>
              resolve({
                ...baseNote,
                title: body.title,
                revision: 2,
              });
          })
      )
      .mockImplementation((_, body) =>
        Promise.resolve({
          ...baseNote,
          title: body.title,
          revision: 3,
        })
      );

    await mountEditor();

    const titleInput = screen.getByLabelText("Note title");
    fireEvent.change(titleInput, { target: { value: "Hello!" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    fireEvent.change(titleInput, { target: { value: "Hello!!" } });

    await act(async () => {
      resolveFirst();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteRequest).toHaveBeenCalledTimes(2);
    expect(updateNoteRequest.mock.calls[0][1].expectedRevision).toBe(1);
    expect(updateNoteRequest.mock.calls[0][1].title).toBe("Hello!");
    expect(updateNoteRequest.mock.calls[1][1].expectedRevision).toBe(2);
    expect(updateNoteRequest.mock.calls[1][1].title).toBe("Hello!!");
  });

  it("coalesces rapid edits during one save into a single follow-up", async () => {
    let resolveFirst;
    updateNoteRequest
      .mockImplementationOnce(
        (_, body) =>
          new Promise((resolve) => {
            resolveFirst = () =>
              resolve({
                ...baseNote,
                title: body.title,
                revision: 2,
              });
          })
      )
      .mockResolvedValue({
        ...baseNote,
        title: "Hello c",
        revision: 3,
      });

    await mountEditor();

    const titleInput = screen.getByLabelText("Note title");
    fireEvent.change(titleInput, { target: { value: "Hello a" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    fireEvent.change(titleInput, { target: { value: "Hello b" } });
    fireEvent.change(titleInput, { target: { value: "Hello c" } });

    await act(async () => {
      resolveFirst();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteRequest).toHaveBeenCalledTimes(2);
    expect(updateNoteRequest.mock.calls[1][1].title).toBe("Hello c");
  });

  it("shows conflict UI on 409 without further autosave attempts", async () => {
    const conflictError = Object.assign(
      new Error(
        "This note was updated elsewhere. Choose which version to keep."
      ),
      {
        isConflict: true,
        conflictDetails: {
          serverNote: {
            id: NOTE_ID,
            title: "Server title",
            content: createEmptyLexicalContent(),
            revision: 5,
          },
        },
      }
    );
    updateNoteRequest.mockRejectedValueOnce(conflictError);

    let unhandled = false;
    const onUnhandled = () => {
      unhandled = true;
    };
    process.on("unhandledRejection", onUnhandled);

    await mountEditor();

    const titleInput = screen.getByLabelText("Note title");
    fireEvent.change(titleInput, { target: { value: "Local edit" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await Promise.resolve();
      await Promise.resolve();
    });

    process.off("unhandledRejection", onUnhandled);
    expect(unhandled).toBe(false);
    expect(
      screen.getByRole("heading", { name: /this note changed elsewhere/i })
    ).toBeInTheDocument();
    expect(updateNoteRequest).toHaveBeenCalledTimes(1);

    fireEvent.change(titleInput, { target: { value: "More typing" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(updateNoteRequest).toHaveBeenCalledTimes(1);
  });

  it("preserves recovery draft on failure and retries with same revision", async () => {
    updateNoteRequest
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ...baseNote,
        title: "Retry title",
        revision: 2,
      });

    await mountEditor();

    const titleInput = screen.getByLabelText("Note title");
    fireEvent.change(titleInput, { target: { value: "Retry title" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await Promise.resolve();
      await Promise.resolve();
    });

    vi.useRealTimers();
    expect((await readRecoveryDraft(USER_ID, NOTE_ID))?.title).toBe(
      "Retry title"
    );
    expect(screen.getByText("Couldn't save")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: /retry/i }).click();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteRequest).toHaveBeenCalledTimes(2);
    expect(updateNoteRequest.mock.calls[1][1]).toMatchObject({
      expectedRevision: 1,
      title: "Retry title",
    });
  });
});
