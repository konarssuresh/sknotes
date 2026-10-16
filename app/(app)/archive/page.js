import { Suspense } from "react";

import { NotesInfiniteList } from "@/features/notes/notes-infinite-list";

export const metadata = {
  title: "Archive — SKNotes",
};

export default function ArchivePage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <NotesInfiniteList
        status="archived"
        title="Archive"
        emptyTitle="No archived notes"
      />
    </Suspense>
  );
}
