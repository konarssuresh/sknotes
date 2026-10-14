import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-title-lg text-foreground font-semibold">
        Page not found
      </h1>
      <p className="text-body-sm text-muted-foreground max-w-md">
        The page you requested does not exist or may have moved.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        Back to Home
      </Link>
    </div>
  );
}
