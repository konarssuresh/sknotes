import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function TextareaField({
  id,
  className,
  invalid,
  describedBy,
  ...props
}) {
  return (
    <Textarea
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn("min-h-24 text-base md:text-base", className)}
      {...props}
    />
  );
}
