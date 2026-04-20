"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MatchCard, User } from "@/components/MatchCard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Search, Sparkles, Users2 } from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function Dashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skillFilter, setSkillFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (skillFilter) params.append("skills", skillFilter);

      const response = await api.get(`/users/potential-matches?${params.toString()}`);
      setPotentialMatches(response.data);
      setCurrentIndex(0);
    } catch (error: any) {
      console.error("Error fetching potential matches:", error);
      toast.error(error?.message || "Failed to load potential matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    const timer = setTimeout(() => {
      fetchMatches();
    }, 400);
    return () => clearTimeout(timer);
  }, [skillFilter, authChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async (userId: string) => {
    try {
      await api.post("/requests/send", { receiverId: userId });
      toast.success("Request sent.");
      showNextUser();
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast.error(error?.message || "Failed to send request.");
      showNextUser();
    }
  };

  const handleReject = () => showNextUser();
  const showNextUser = () => setCurrentIndex((i) => i + 1);

  if (!authChecked) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const current = potentialMatches[currentIndex];
  const exhausted = potentialMatches.length > 0 && currentIndex >= potentialMatches.length;
  const hasAny = potentialMatches.length > 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.15),transparent_60%)]" />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <SectionLabel className="justify-center">
            <Sparkles size={11} className="text-[var(--ember)]" />
            Discover
          </SectionLabel>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Find your{" "}
            <span className="font-serif italic font-normal text-ember-gradient">hackmate</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Hand-picked teammates from hackathons you're in. Skip what doesn't click —
            connect when it does.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)]">
          <Search size={15} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by skill (e.g. React, Rust)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {skillFilter && (
            <button
              onClick={() => setSkillFilter("")}
              className="rounded-full px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
          {loading ? (
            <div className="relative h-[540px] animate-pulse rounded-[28px] border border-white/[0.06] bg-white/[0.02]" />
          ) : !hasAny ? (
            <EmptyState
              title="No matches yet."
              body="Join a hackathon to surface teammates. Matches show people from hackathons you're in."
              cta={{ label: "Browse hackathons", href: "/hackathons" }}
            />
          ) : exhausted ? (
            <EmptyState
              title="You're all caught up."
              body="No more matches right now. Tweak your filters or check back later."
              cta={{ label: "Reset filter", onClick: () => setSkillFilter("") }}
            />
          ) : (
            <>
              <MatchCard
                key={current.id}
                user={current}
                onAccept={handleAccept}
                onReject={handleReject}
              />
              <p className="mt-4 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
                {currentIndex + 1} / {potentialMatches.length}
              </p>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { label: string } & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/[0.08] bg-white/[0.015] px-8 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground">
        <Users2 size={18} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && (
        <div className="mt-6">
          {"href" in cta && cta.href ? (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]"
            >
              {cta.label}
            </Link>
          ) : (
            <button
              onClick={cta.onClick}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]"
            >
              {cta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
