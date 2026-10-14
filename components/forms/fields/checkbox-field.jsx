import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CheckboxField({
  id,
  label,
  className,
  invalid,
  describedBy,
  checked,
  onCheckedChange,
  disabled,
  ...props
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {label ? (
        <Label htmlFor={id} className="text-body-sm leading-snug font-normal">
          {label}
        </Label>
      ) : null}
    </div>
  );
}
