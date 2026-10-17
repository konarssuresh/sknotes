"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatedListItem } from "@/components/motion/animated-presence";
import { NoteCard } from "@/components/notes/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchNotesPage, searchNotesPage } from "@/features/notes/note-api";
import { noteKeys, tagKeys } from "@/features/notes/query-keys";
import { useDebouncedValue } from "@/features/notes/use-debounced-value";
import { fetchTags } from "@/features/tags/tag-api";
import { authClient } from "@/lib/auth/auth-client";

import { useOfflineNotesListCache } from "./use-offline-notes-list-cache";

/**
 * @param {{
 *   status: "active" | "archived" | "trashed";
 *   title: string;
 *   showSearch?: boolean;
 *   emptyTitle?: string;
 *   emptyDescription?: string;
 *   compact?: boolean;
 * }} props
 */
export function NotesInfiniteList({
  status,
  title,
  showSearch = true,
  emptyTitle,
  emptyDescription,
  compact = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagId = searchParams.get("tagId");
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 300);
  const sentinelRef = useRef(null);

  const { data: tags = [] } = useQuery({
    queryKey: tagKeys.list(),
    queryFn: fetchTags,
  });

  const tagMap = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag.name])),
    [tags]
  );
  const activeTag = tagId ? tags.find((tag) => tag.id === tagId) : null;

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const { snapshot, showingStaleCopy, persist, online } =
    useOfflineNotesListCache(userId, status, tagId, debouncedQuery);

  const useSearch = debouncedQuery.trim().length > 0;
  const listKey = useSearch
    ? noteKeys.search(status, { q: debouncedQuery, tagId })
    : noteKeys.list(status, { tagId });

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: listKey,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      useSearch
        ? searchNotesPage({
            q: debouncedQuery,
            status,
            tagId,
            cursor: pageParam,
          })
        : fetchNotesPage({ status, tagId, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: online || Boolean(snapshot),
    placeholderData:
      !online && snapshot
        ? { pages: [snapshot], pageParams: [null] }
        : undefined,
  });

  const notes = data?.pages.flatMap((page) => page.notes) ?? [];

  useEffect(() => {
    const firstPage = data?.pages?.[0];
    if (firstPage && online && !useSearch) {
      persist(firstPage);
    }
  }, [data, online, persist, useSearch]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const clearTagFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tagId");
    router.push(`?${params.toString()}`);
  };

  const clearSearch = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.replace(`?${params.toString()}`);
  };

  return (
    <div
      className={
        compact
          ? "w-full space-y-4"
          : "mx-auto w-full max-w-(--content-max) space-y-6"
      }
    >
      {compact ? (
        <h2 className="text-body font-semibold">{title}</h2>
      ) : (
        <h1 className="text-title font-semibold">{title}</h1>
      )}
      {showSearch ? (
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes"
          aria-label="Search notes"
        />
      ) : null}
      {showingStaleCopy ? (
        <p className="text-muted-foreground text-sm" role="status">
          Offline — showing the last saved copy from this device.
        </p>
      ) : null}
      {activeTag ? (
        <div className="flex items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
            {activeTag.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearTagFilter}
          >
            Clear filter
          </Button>
        </div>
      ) : null}
      {!online && !snapshot && !isLoading ? (
        <p className="text-muted-foreground" role="status">
          You&apos;re offline. Open notes once while online to keep a read-only
          copy on this device.
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-muted-foreground">Loading notes…</p>
      ) : isError ? (
        <div className="space-y-3">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Could not load notes"}
          </p>
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : notes.length === 0 ? (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {useSearch
              ? `No matches for “${debouncedQuery}”`
              : (emptyTitle ?? "No notes yet.")}
          </p>
          {emptyDescription ? (
            <p className="text-muted-foreground text-sm">{emptyDescription}</p>
          ) : null}
          {useSearch ? (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Clear search
            </Button>
          ) : status === "active" ? (
            <Link
              href="/notes/new"
              className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium"
            >
              Create note
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {notes.map((note) => (
            <AnimatedListItem key={note.id} show>
              <NoteCard
                note={note}
                href={`/notes/${note.id}`}
                tagNames={(note.tagIds ?? []).map(
                  (id) => tagMap.get(id) ?? "Tag"
                )}
              />
            </AnimatedListItem>
          ))}
        </ul>
      )}
      {isFetchNextPageError ? (
        <div className="py-4 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchNextPage()}
          >
            Retry loading more
          </Button>
        </div>
      ) : null}
      {isFetchingNextPage ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          Loading more…
        </p>
      ) : null}
      <div ref={sentinelRef} className="h-1" aria-hidden />
    </div>
  );
}
