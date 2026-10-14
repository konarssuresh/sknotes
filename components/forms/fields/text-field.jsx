import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TextField({
  id,
  type = "text",
  className,
  invalid,
  describedBy,
  required,
  ...props
}) {
  return (
    <Input
      id={id}
      type={type}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy}
      className={cn("h-11 text-base md:text-base", className)}
      {...props}
    />
  );
}
