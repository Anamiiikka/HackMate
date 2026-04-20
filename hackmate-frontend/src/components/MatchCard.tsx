"use client";

import { Check, Sparkles, X } from "lucide-react";
import Link from "next/link";

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  bio?: string | null;
  skills: string[];
  avatar_url?: string | null;
  experience_level?: string | null;
}

interface MatchCardProps {
  user: User;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
}

export function MatchCard({ user, onAccept, onReject }: MatchCardProps) {
  const name = user.name || "User";
  const initials =
    name
      .split(" ")
      .map((n) => n.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-card/70 shadow-soft backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.22),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-[0.25] mask-fade-b" />

      <div className="relative px-7 pt-10 pb-7 text-center">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] p-[2px] shadow-ember">
          <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[var(--ink-1)] text-2xl font-semibold text-white">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
          {name}
        </h2>

        <div className="mt-2 flex items-center justify-center gap-2 text-[11px]">
          {user.experience_level && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 capitalize text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_oklch,var(--mint)_80%,transparent)]" />
              {user.experience_level}
            </span>
          )}
          {user.username && (
            <span className="text-muted-foreground">@{user.username}</span>
          )}
        </div>

        <p className="mt-5 mx-auto max-w-sm text-[14px] leading-relaxed text-muted-foreground text-pretty">
          {user.bio || "No bio yet."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {(user.skills || []).slice(0, 8).map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-foreground"
            >
              {s}
            </span>
          ))}
          {user.skills && user.skills.length > 8 && (
            <span className="rounded-full bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-muted-foreground">
              +{user.skills.length - 8}
            </span>
          )}
        </div>

        <Link
          href={`/users/${user.id}`}
          className="mt-6 inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          View full profile
          <Sparkles size={12} className="text-[var(--ember)]" />
        </Link>
      </div>

      <div className="relative flex items-center justify-between gap-4 border-t border-white/[0.06] bg-black/20 px-6 py-5">
        <button
          onClick={() => onReject(user.id)}
          className="group/btn flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-muted-foreground transition-all hover:border-white/[0.15] hover:text-foreground"
        >
          <X size={16} />
          Skip
        </button>
        <button
          onClick={() => onAccept(user.id)}
          className="group/btn flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px"
        >
          <Check size={16} />
          Connect
        </button>
      </div>
    </article>
  );
}
