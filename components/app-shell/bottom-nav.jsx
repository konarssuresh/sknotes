"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavItems, settingsNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { NavIcon } from "./nav-icons";

function BottomNavLink({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      className={cn(
        "text-caption text-muted-foreground flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1.5",
        active && "text-primary"
      )}
      aria-current={active ? "page" : undefined}
    >
      <NavIcon name={icon} className="size-6 shrink-0" />
      <span className="leading-none">{label}</span>
    </Link>
  );
}

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const home = primaryNavItems[0];
  const notes = primaryNavItems[1];

  return (
    <nav
      className="border-border bg-popover fixed inset-x-0 bottom-0 z-(--z-nav) border-t md:hidden"
      aria-label="Main"
      style={{
        paddingBottom: `max(0.5rem, env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <div
        className="mx-auto grid max-w-lg grid-cols-4 items-center px-1"
        style={{ minHeight: "var(--bottom-nav-height)" }}
      >
        <BottomNavLink
          href={home.href}
          label={home.label}
          icon={home.icon}
          active={isActive(pathname, home.href)}
        />
        <Link
          href="/notes"
          className="text-caption text-muted-foreground flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-1.5"
          aria-label="Create note"
        >
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm">
            <NavIcon name="create" className="size-5" />
          </span>
          <span className="leading-none">Create</span>
        </Link>
        <BottomNavLink
          href={notes.href}
          label={notes.label}
          icon={notes.icon}
          active={isActive(pathname, notes.href)}
        />
        <BottomNavLink
          href={settingsNavItem.href}
          label={settingsNavItem.label}
          icon={settingsNavItem.icon}
          active={isActive(pathname, settingsNavItem.href)}
        />
      </div>
    </nav>
  );
}
