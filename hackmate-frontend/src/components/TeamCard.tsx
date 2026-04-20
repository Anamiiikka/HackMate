"use client";

import Link from "next/link";
import { ArrowUpRight, Users2 } from "lucide-react";

export interface Team {
  id: string;
  name: string;
  hackathon_id: string;
  hackathon_name?: string;
  member_count?: number;
  description?: string | null;
}

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const name = team.name || "Team";
  const initials =
    name
      .split(" ")
      .map((n) => n.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "TM";

  return (
    <Link
      href={`/teams/${team.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-sm font-semibold text-white">
        {initials || "TM"}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-ember-gradient">
          {name}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {team.hackathon_name || "Hackathon team"}
        </p>
      </div>
      {team.member_count !== undefined && (
        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground">
          <Users2 size={12} />
          {team.member_count}
        </span>
      )}
      <ArrowUpRight size={16} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
