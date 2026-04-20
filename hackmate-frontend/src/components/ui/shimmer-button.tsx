"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

type Variant = "primary" | "ghost";

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

type Props = ButtonProps | LinkProps;

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] text-white shadow-ember hover:-translate-y-px active:translate-y-0",
  ghost:
    "bg-white/5 text-foreground border border-white/10 hover:bg-white/10",
};

function Shine() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 translate-x-[-120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
    />
  );
}

export function ShimmerButton(props: Props) {
  const { variant = "primary", className, children } = props;

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={cn(base, variants[variant], className)}
      >
        <Shine />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  const { href: _ignore, variant: _v, className: _c, children: _ch, ...rest } =
    props as ButtonProps & { href?: undefined };
  return (
    <button {...rest} className={cn(base, variants[variant], className)}>
      <Shine />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
