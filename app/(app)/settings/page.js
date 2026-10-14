import { ThemePicker } from "@/components/settings/theme-picker";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-(--list-max) flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-title-lg text-foreground font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-body-sm text-muted-foreground">
          Account and profile controls arrive in Phase 6. Theme preference is
          available now.
        </p>
      </div>
      <section className="flex flex-col gap-3" aria-labelledby="theme-heading">
        <h2 id="theme-heading" className="text-label text-foreground">
          Theme
        </h2>
        <ThemePicker />
      </section>
    </div>
  );
}
