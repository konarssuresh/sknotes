import Link from "next/link";
import { ChevronRight } from "lucide-react";

const links = [
  { href: "/tags", label: "Tags" },
  { href: "/archive", label: "Archive" },
  { href: "/trash", label: "Trash" },
];

export function SettingsLibraryLinks() {
  return (
    <nav className="flex flex-col gap-2" aria-label="Library shortcuts">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="border-border text-foreground hover:bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors"
        >
          {label}
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
        </Link>
      ))}
    </nav>
  );
}
