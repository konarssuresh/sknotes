import Link from "next/link";
import { Suspense } from "react";

import { NotesInfiniteList } from "@/features/notes/notes-infinite-list";

export const metadata = {
  title: "Notes — SKNotes",
};

export default function NotesPage() {
  return (
    <>
      <div className="lg:hidden">
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <NotesInfiniteList status="active" title="Notes" />
        </Suspense>
      </div>
      <div className="hidden min-h-[40vh] flex-1 flex-col items-center justify-center gap-4 px-4 text-center lg:flex">
        <p className="text-muted-foreground max-w-sm">
          Select a note from the list or create a new one.
        </p>
        <Link
          href="/notes/new"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium"
        >
          Create note
        </Link>
      </div>
    </>
  );
}
