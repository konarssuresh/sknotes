import { Suspense } from "react";

import { OfflineSyncProvider } from "@/features/offline/offline-sync-provider";

import { BottomNav } from "./bottom-nav";
import { SidebarNav } from "./sidebar-nav";

function SidebarFallback() {
  return (
    <aside
      className="border-border bg-sidebar hidden min-h-dvh w-(--sidebar-width) shrink-0 border-r md:block"
      aria-hidden
    />
  );
}

function BottomNavFallback() {
  return (
    <div
      className="h-[calc(var(--bottom-nav-height)+max(0.5rem,env(safe-area-inset-bottom)))] md:hidden"
      aria-hidden
    />
  );
}

export function AppShell({ children }) {
  return (
    <OfflineSyncProvider>
      <div className="bg-background flex min-h-dvh w-full flex-1">
        <Suspense fallback={<SidebarFallback />}>
          <SidebarNav />
        </Suspense>
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <main
            id="main-content"
            className="flex-1 px-(--space-page-x) py-(--space-page-y) pb-[calc(var(--bottom-nav-height)+max(0.5rem,env(safe-area-inset-bottom))+var(--space-4))] md:pb-(--space-page-y)"
          >
            {children}
          </main>
          <Suspense fallback={<BottomNavFallback />}>
            <BottomNav />
          </Suspense>
        </div>
      </div>
    </OfflineSyncProvider>
  );
}
