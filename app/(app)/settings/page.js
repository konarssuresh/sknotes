import { ThemePicker } from "@/components/settings/theme-picker";
import { DeleteAccountForm } from "@/features/auth/delete-account-form";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { AccountSummary } from "@/features/settings/account-summary";
import { SettingsLibraryLinks } from "@/features/settings/settings-library-links";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-8 md:max-w-[480px]">
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
        aria-labelledby="appearance-heading"
      >
        <h2 id="appearance-heading" className="text-label text-foreground">
          Appearance
        </h2>
        <ThemePicker />
      </section>
      <section
        className="flex flex-col gap-3"
        aria-labelledby="account-heading"
      >
        <h2 id="account-heading" className="text-label text-foreground">
          Account
        </h2>
        <AccountSummary />
        <div
          className="border-border flex flex-col gap-3 border-t pt-6"
          aria-labelledby="account-danger-heading"
        >
          <h3
            id="account-danger-heading"
            className="text-body-sm text-muted-foreground font-medium"
          >
            Danger zone
          </h3>
          <DeleteAccountForm />
        </div>
      </section>
      <section
        className="flex flex-col gap-3"
        aria-labelledby="library-heading"
      >
        <h2 id="library-heading" className="text-label text-foreground">
          Library
        </h2>
        <SettingsLibraryLinks />
      </section>
      <section
        className="flex flex-col gap-3"
        aria-labelledby="session-heading"
      >
        <h2 id="session-heading" className="text-label text-foreground">
          Session
        </h2>
        <SignOutButton />
      </section>
    </div>
  );
}
