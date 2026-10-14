import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function getFieldDescribedBy({ id, hint, error }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return { hintId, errorId, describedBy };
}

export function FieldLayout({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}) {
  const { hintId, errorId } = getFieldDescribedBy({ id, hint, error });

  return (
    <div className={cn("group/field flex flex-col gap-2", className)}>
      {label ? (
        <Label
          htmlFor={id}
          className="text-label group-has-[:disabled]/field:opacity-50"
        >
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </Label>
      ) : null}
      {children}
      {hint ? (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
