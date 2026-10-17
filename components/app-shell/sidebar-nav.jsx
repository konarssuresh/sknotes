"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  primaryNavItems,
  secondaryNavItems,
  settingsNavItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { BrandMark } from "./brand-mark";
import { NavIcon } from "./nav-icons";

function NavLink({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground font-semibold"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <NavIcon name={icon} className="size-5 shrink-0" />
      {label}
    </Link>
  );
}

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      className="border-border bg-sidebar text-sidebar-foreground sticky top-0 hidden min-h-dvh w-(--sidebar-width) shrink-0 flex-col self-start border-r md:flex"
      aria-label="Main"
    >
      <div className="border-sidebar-border flex h-(--header-height) items-center border-b px-4">
        <BrandMark />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(pathname, item.href)}
          />
        ))}
        <Link
          href="/notes/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "mt-2 w-full justify-start gap-2"
          )}
        >
          <NavIcon name="create" className="size-4" />
          Create note
        </Link>
        <div
          className="border-sidebar-border my-3 border-t"
          role="presentation"
        />
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(pathname, item.href)}
          />
        ))}
        <div
          className="border-sidebar-border my-3 mt-auto border-t"
          role="presentation"
        />
        <NavLink
          {...settingsNavItem}
          active={isActive(pathname, settingsNavItem.href)}
        />
      </nav>
    </aside>
  );
}
