"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User } from "@/components/MatchCard";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";
import { ArrowLeft, Crown, LogOut, MessageSquare, Users2 } from "lucide-react";

interface TeamMember extends User {
  role: "leader" | "member";
}

interface TeamDetails {
  id: string;
  name: string;
  hackathon_id: string;
  hackathon_name?: string;
  created_by: string;
  members: TeamMember[];
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await api.get(`/teams/${id}`);
        setTeam(response.team);
      } catch (error) {
        console.error("Error fetching team details:", error);
        toast.error("Failed to load team details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading team…
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 text-center">
        <div>
          <h3 className="font-display text-xl font-semibold">Team not found</h3>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </div>
    );
  }

  const teamName = team.name || "Team";
  const initials =
    teamName
      .split(" ")
      .map((n) => n.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "TM";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24 pt-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.12),transparent_60%)]" />

      <Container className="relative max-w-4xl">
        <Link
          href="/teams"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> All teams
        </Link>

        <section className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-card/70 p-8 shadow-soft backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.16),transparent_60%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-lg font-semibold text-white shadow-ember">
                {initials}
              </div>
              <div>
                <SectionLabel>Team</SectionLabel>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{teamName}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {team.hackathon_name || "Hackathon team"} ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <Users2 size={12} /> {team.members.length}{" "}
                    {team.members.length === 1 ? "member" : "members"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]">
                <MessageSquare size={14} /> Team chat
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/20">
                <LogOut size={14} /> Leave
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <SectionLabel>Members</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">Who's in</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {team.members.map((m) => {
              const memberName = m.name || "Member";
              const initial = memberName.charAt(0).toUpperCase();
              return (
                <Link
                  key={m.id}
                  href={`/users/${m.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.03]"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-sm font-semibold text-white">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt={memberName} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{memberName}</p>
                    <p className="flex items-center gap-1.5 text-[11px] capitalize text-muted-foreground">
                      {m.role === "leader" && (
                        <Crown size={11} className="text-[var(--ember)]" />
                      )}
                      {m.role}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </Container>
    </div>
  );
}
