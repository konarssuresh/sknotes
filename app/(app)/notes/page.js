import { Suspense } from "react";

import { NotesInfiniteList } from "@/features/notes/notes-infinite-list";

export const metadata = {
  title: "Notes — SKNotes",
};

export default function NotesPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <NotesInfiniteList status="active" title="Notes" />
    </Suspense>
  );
}
