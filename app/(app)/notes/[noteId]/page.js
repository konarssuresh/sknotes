import { NoteEditorScreen } from "@/features/notes/note-editor-screen";
import { requireVerifiedSession } from "@/lib/auth/session";

export const metadata = {
  title: "Note — SKNotes",
};

export const instant = false;

export default async function NoteEditorPage({ params }) {
  const { noteId } = await params;
  const session = await requireVerifiedSession();

  if (noteId === "new") {
    return <NoteEditorScreen userId={session.user.id} noteId="new" isNew />;
  }

  return (
    <NoteEditorScreen userId={session.user.id} noteId={noteId} isNew={false} />
  );
}
