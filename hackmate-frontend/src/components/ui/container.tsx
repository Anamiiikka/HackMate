import { cn } from "@/lib/utils";

export function Container({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)}
      {...rest}
    />
  );
}

export function SectionLabel({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
      {...rest}
    >
      <span className="block h-px w-6 bg-gradient-to-r from-transparent to-[color-mix(in_oklch,var(--ember)_60%,transparent)]" />
      {children}
    </span>
  );
}
