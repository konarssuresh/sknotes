"use client";

import { Suspense } from "react";

import { NotesInfiniteList } from "@/features/notes/notes-infinite-list";

/**
 * Desktop split: persistent notes list + main column. Mobile uses full-width children only.
 * @param {{ children: React.ReactNode }} props
 */
export function NotesRouteLayout({ children }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col lg:flex-row">
      <aside className="border-border hidden min-h-0 w-full max-w-sm shrink-0 flex-col border-r lg:flex lg:max-h-[calc(100dvh-var(--bottom-nav-height))]">
        <div className="min-h-0 flex-1 overflow-y-auto px-(--space-page-x) py-(--space-page-y)">
          <Suspense
            fallback={
              <p className="text-muted-foreground text-sm">Loading notes…</p>
            }
          >
            <NotesInfiniteList
              status="active"
              title="Notes"
              showSearch
              compact
            />
          </Suspense>
        </div>
      </aside>
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
