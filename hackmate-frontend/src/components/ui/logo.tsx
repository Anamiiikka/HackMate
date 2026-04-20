import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}

export function Logo({ className, href = "/", showWordmark = true }: LogoProps) {
  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.68_0.2_25))] shadow-ember">
        <svg
          viewBox="0 0 32 32"
          width="18"
          height="18"
          fill="none"
          className="relative z-10 text-white"
          aria-hidden="true"
        >
          <path
            d="M8 4v24M24 4v24M8 16h16M24 16l-6-6M24 16l-6 6"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
      </span>
      {showWordmark && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
          HackMate
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
