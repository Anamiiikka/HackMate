"use client";

import Link from "next/link";
import { ArrowUpRight, Globe2, MapPin, Users2 } from "lucide-react";

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  mode: "online" | "offline" | "hybrid";
  max_team_size?: number;
  min_team_size?: number;
  tech_focus?: string[];
  website_url?: string;
}

interface HackathonCardProps {
  hackathon: Hackathon;
}

function modeColor(mode: string) {
  if (mode === "online") return "var(--mint)";
  if (mode === "offline") return "var(--ember)";
  return "oklch(0.78 0.14 80)";
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const start = new Date(hackathon.start_date);
  const end = new Date(hackathon.end_date);

  return (
    <Link
      href={`/hackathons/${hackathon.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.2_40/0.18),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-foreground">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: `color-mix(in oklch, ${modeColor(hackathon.mode)} 80%, transparent)` }}
          />
          <span className="capitalize">{hackathon.mode}</span>
        </span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          <span className="mx-1 text-muted-foreground/60">→</span>
          {end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-ember-gradient">
        {hackathon.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {hackathon.description}
      </p>

      {hackathon.tech_focus && hackathon.tech_focus.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {hackathon.tech_focus.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
          {hackathon.tech_focus.length > 4 && (
            <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground">
              +{hackathon.tech_focus.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-5 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          {hackathon.mode === "online" ? <Globe2 size={13} /> : <MapPin size={13} />}
          <span className="truncate">{hackathon.location || "Remote"}</span>
        </span>
        {hackathon.max_team_size && (
          <span className="inline-flex items-center gap-1.5">
            <Users2 size={13} />
            Up to {hackathon.max_team_size}
          </span>
        )}
        <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
