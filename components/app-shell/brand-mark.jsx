import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({ className }) {
  return (
    <Link
      href="/"
      className={cn(
        "text-title text-foreground font-semibold tracking-tight",
        className
      )}
    >
      SKNotes
    </Link>
  );
}
