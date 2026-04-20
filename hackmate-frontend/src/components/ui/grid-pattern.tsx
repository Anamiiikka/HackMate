import { cn } from "@/lib/utils";

type Variant = "dots" | "lines";

interface GridPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  fade?: "radial" | "bottom" | "none";
}

export function GridPattern({
  variant = "dots",
  fade = "radial",
  className,
  ...rest
}: GridPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        variant === "dots" ? "dot-grid" : "grid-lines",
        fade === "radial" && "mask-fade-radial",
        fade === "bottom" && "mask-fade-b",
        className,
      )}
      {...rest}
    />
  );
}
