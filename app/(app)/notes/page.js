import { NotesList } from "@/features/notes/notes-list";

export const metadata = {
  title: "Notes — SKNotes",
};

export default function NotesPage() {
  return (
    <div className="mx-auto w-full max-w-(--content-max) space-y-6">
      <h1 className="text-title font-semibold">Notes</h1>
      <NotesList />
    </div>
  );
}
