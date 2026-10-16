import Link from "next/link";

import { ThemePicker } from "@/components/settings/theme-picker";
import { DeleteAccountForm } from "@/features/auth/delete-account-form";
import { SignOutButton } from "@/features/auth/sign-out-button";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-(--list-max) flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-title-lg text-foreground font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-body-sm text-muted-foreground">
          Manage your session, theme, and account.
        </p>
      </div>
      <section
        className="flex flex-col gap-3"
        aria-labelledby="session-heading"
      >
        <h2 id="session-heading" className="text-label text-foreground">
          Session
        </h2>
        <SignOutButton />
      </section>
      <section
        className="flex flex-col gap-3"
        aria-labelledby="library-heading"
      >
        <h2 id="library-heading" className="text-label text-foreground">
          Library
        </h2>
        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/tags" className="hover:underline">
            Tags
          </Link>
          <Link href="/archive" className="hover:underline">
            Archive
          </Link>
          <Link href="/trash" className="hover:underline">
            Trash
          </Link>
        </nav>
      </section>
      <section className="flex flex-col gap-3" aria-labelledby="theme-heading">
        <h2 id="theme-heading" className="text-label text-foreground">
          Theme
        </h2>
        <ThemePicker />
      </section>
      <section
        className="border-border flex flex-col gap-3 border-t pt-8"
        aria-labelledby="account-heading"
      >
        <h2 id="account-heading" className="text-label text-foreground">
          Account
        </h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
