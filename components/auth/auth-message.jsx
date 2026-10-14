export function AuthMessage({ variant = "error", children }) {
  if (!children) {
    return null;
  }

  const styles =
    variant === "success"
      ? "border-border bg-muted text-foreground"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <p
      role="alert"
      className={`text-body-sm mb-4 rounded-md border px-3 py-2 ${styles}`}
    >
      {children}
    </p>
  );
}
