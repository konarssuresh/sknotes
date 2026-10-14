import { PlaceholderPage } from "@/components/app-shell/placeholder-page";

export default async function NoteEditorPage({ params }) {
  const { noteId } = await params;

  return (
    <PlaceholderPage
      title="Note"
      description={`Editor and autosave for note “${noteId}” are not implemented yet (Phase 3).`}
    />
  );
}
