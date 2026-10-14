import { cn } from "@/lib/utils";

export function BrandSymbol({ size = 32, className, decorative = false }) {
  return (
    <svg
      className={cn("text-foreground shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "SKNotes"}
    >
      <rect
        x="4"
        y="3"
        width="22"
        height="26"
        rx="4"
        className="fill-card stroke-foreground"
        strokeWidth="1.75"
      />
      <path
        d="M22 3v5a2 2 0 0 0 2 2h4"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 12h6M9 16h8M9 20h5"
        className="stroke-primary opacity-55"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <text
        x="9"
        y="11.5"
        fontFamily="system-ui, sans-serif"
        fontSize="7.5"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-0.04em"
      >
        SK
      </text>
    </svg>
  );
}
