"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NoteCard } from "@/components/notes/note-card";
import { Input } from "@/components/ui/input";
import { fetchNotesPage } from "@/features/notes/note-api";
import { noteKeys, tagKeys } from "@/features/notes/query-keys";
import { fetchTags } from "@/features/tags/tag-api";

export function HomeScreen() {
  const router = useRouter();

  const { data: pinnedPage, isLoading: pinsLoading } = useQuery({
    queryKey: noteKeys.list("active", { pinned: true }),
    queryFn: () => fetchNotesPage({ status: "active", pinned: true, limit: 5 }),
  });

  const { data: recentPage, isLoading: recentLoading } = useQuery({
    queryKey: [...noteKeys.all, "home-recent"],
    queryFn: () => fetchNotesPage({ status: "active", limit: 10 }),
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: tagKeys.list(),
    queryFn: fetchTags,
  });

  const pinned = pinnedPage?.notes ?? [];
  const recent = recentPage?.notes ?? [];
  const frequentTags = [...tags]
    .sort((a, b) => b.noteCount - a.noteCount)
    .slice(0, 8);

  const hasAnyContent =
    pinned.length > 0 || recent.length > 0 || frequentTags.length > 0;
  const loading = pinsLoading || recentLoading || tagsLoading;

  return (
    <div className="mx-auto w-full max-w-(--content-max) space-y-8">
      <h1 className="text-title-lg font-semibold">Home</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const input = form.elements.namedItem("home-search");
          const value =
            input instanceof HTMLInputElement ? input.value.trim() : "";
          router.push(
            value ? `/notes?q=${encodeURIComponent(value)}` : "/notes"
          );
        }}
      >
        <Input
          name="home-search"
          placeholder="Search notes"
          aria-label="Search notes"
        />
      </form>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !hasAnyContent ? (
        <div className="space-y-4 text-center">
          <h2 className="text-title font-medium">Your notes live here</h2>
          <p className="text-muted-foreground text-sm">
            Create your first note to get started.
          </p>
          <Link
            href="/notes/new"
            className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium"
          >
            Create note
          </Link>
        </div>
      ) : (
        <>
          {pinned.length > 0 ? (
            <section aria-labelledby="pinned-heading">
              <h2 id="pinned-heading" className="text-label mb-3 font-medium">
                Pinned
              </h2>
              <ul className="divide-border divide-y">
                {pinned.map((note) => (
                  <li key={note.id}>
                    <NoteCard note={note} href={`/notes/${note.id}`} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {recent.length > 0 ? (
            <section aria-labelledby="recent-heading">
              <h2 id="recent-heading" className="text-label mb-3 font-medium">
                Recent
              </h2>
              <ul className="divide-border divide-y">
                {recent.map((note) => (
                  <li key={note.id}>
                    <NoteCard note={note} href={`/notes/${note.id}`} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {frequentTags.length > 0 ? (
            <section aria-labelledby="tags-heading">
              <h2 id="tags-heading" className="text-label mb-3 font-medium">
                Frequent tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {frequentTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/notes?tagId=${tag.id}`}
                    className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-full px-3 py-1 text-sm"
                  >
                    {tag.name}
                    <span className="text-caption ml-1">({tag.noteCount})</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <footer className="text-muted-foreground flex flex-wrap gap-3 text-sm">
            <Link href="/tags">Tags</Link>
            <Link href="/archive">Archive</Link>
            <Link href="/trash">Trash</Link>
          </footer>
        </>
      )}
    </div>
  );
}
