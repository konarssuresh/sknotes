import { BrandLockup } from "@/components/app-shell/brand-lockup";

export function AuthCard({ title, children, footer, showBrandHeading = true }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-(--space-page-x) py-8">
      {showBrandHeading ? (
        <BrandLockup
          symbolSize={40}
          asHeading={!title}
          className="mb-8 justify-center"
        />
      ) : null}
      <div className="border-border bg-card w-full max-w-[400px] rounded-lg border p-6 shadow-sm">
        {title ? (
          <h1 className="text-title-lg text-foreground mb-6 font-semibold tracking-tight">
            {title}
          </h1>
        ) : null}
        {children}
      </div>
      {footer ? (
        <div className="text-body-sm text-muted-foreground mt-6 text-center">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
