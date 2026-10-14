export function PlaceholderPage({ title, description }) {
  return (
    <div className="mx-auto flex w-full max-w-(--list-max) flex-col gap-3">
      <h1 className="text-title-lg text-foreground font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-body-sm text-muted-foreground">{description}</p>
    </div>
  );
}
