import { NoteEditorScreen } from "@/features/notes/note-editor-screen";
import { requireVerifiedSession } from "@/lib/auth/session";

export const metadata = {
  title: "New note — SKNotes",
};

export const instant = false;

export default async function NewNotePage() {
  const session = await requireVerifiedSession();

  return <NoteEditorScreen userId={session.user.id} noteId="new" isNew />;
}
