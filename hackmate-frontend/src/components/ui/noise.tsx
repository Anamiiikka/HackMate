import { cn } from "@/lib/utils";

export function Noise({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 noise opacity-40 mix-blend-overlay",
        className,
      )}
    />
  );
}
