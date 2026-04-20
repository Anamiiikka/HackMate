"use client";

import { useEffect, useState } from "react";
import { TeamCard, Team } from "@/components/TeamCard";
import { api } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Plus, Users2 } from "lucide-react";

export default function MyTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/teams");
        setTeams(response.teams);
      } catch (error) {
        console.error("Error fetching my teams:", error);
        toast.error("Failed to load your teams.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24 pt-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.1),transparent_60%)]" />

      <Container className="relative max-w-4xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Working together</SectionLabel>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Your teams
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Every team you're part of — jump in, chat, and keep shipping.
            </p>
          </div>
          <Link
            href="/teams/create"
            className="inline-flex items-center gap-2 self-start rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-4 py-2.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px"
          >
            <Plus size={14} />
            New team
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
              ))}
            </div>
          ) : teams.length > 0 ? (
            <div className="grid gap-4">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground">
                <Users2 size={18} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No teams yet</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                Accept a team request, or start your own.
              </p>
              <Link
                href="/teams/create"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]"
              >
                <Plus size={14} />
                Create a team
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
