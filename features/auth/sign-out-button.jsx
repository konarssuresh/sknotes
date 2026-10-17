"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import {
  clearClientSessionState,
  userHasUnsyncedWork,
} from "@/lib/offline/client-session";

function SignOutConfirmDialog({ open, onCancel, onConfirm, pending }) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-title"
    >
      <div className="bg-popover border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h2 id="signout-title" className="text-title font-semibold">
          Sign out with pending changes?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Some edits have not synced to the server yet. They stay on this device
          for your account, but other devices will not see them until you sign
          in and sync again.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Signing out…" : "Sign out anyway"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const completeSignOut = async () => {
    setPending(true);
    clearClientSessionState(queryClient);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-fit"
        disabled={pending}
        onClick={async () => {
          if (userId && (await userHasUnsyncedWork(userId))) {
            setConfirmOpen(true);
            return;
          }
          await completeSignOut();
        }}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      <SignOutConfirmDialog
        open={confirmOpen}
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await completeSignOut();
        }}
      />
    </>
  );
}
