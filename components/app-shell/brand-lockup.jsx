import Link from "next/link";

import { cn } from "@/lib/utils";

import { BrandSymbol } from "./brand-symbol";

export function BrandLockup({
  symbolSize = 40,
  className,
  asHeading = false,
  href,
}) {
  const wordmark = (
    <span className="text-title-lg font-semibold tracking-tight">
      <span className="text-primary">SK</span>
      <span className="text-foreground">Notes</span>
    </span>
  );

  const content = (
    <>
      <BrandSymbol size={symbolSize} decorative={asHeading} />
      {wordmark}
    </>
  );

  const layoutClass = cn(
    "inline-flex items-center gap-3 text-foreground",
    className
  );

  if (asHeading) {
    return <h1 className={layoutClass}>{content}</h1>;
  }

  if (href) {
    return (
      <Link href={href} className={layoutClass}>
        {content}
      </Link>
    );
  }

  return <div className={layoutClass}>{content}</div>;
}
