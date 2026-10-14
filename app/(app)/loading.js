export default function AppLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-(--list-max) flex-col gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="bg-muted animate-shimmer h-8 w-40 rounded-lg" />
      <div className="bg-muted animate-shimmer h-4 w-full max-w-md rounded-md" />
      <div className="bg-muted animate-shimmer h-24 rounded-lg" />
    </div>
  );
}
