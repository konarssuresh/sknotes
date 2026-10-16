import { Suspense } from "react";

import { NotesInfiniteList } from "@/features/notes/notes-infinite-list";

export const metadata = {
  title: "Trash — SKNotes",
};

export default function TrashPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <NotesInfiniteList
        status="trashed"
        title="Trash"
        showSearch={false}
        emptyTitle="Trash is empty"
      />
    </Suspense>
  );
}
