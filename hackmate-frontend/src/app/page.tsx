"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe2, MapPin, Sparkles, Users2 } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Container, SectionLabel } from "@/components/ui/container";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface Hackathon {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  mode: "online" | "offline" | "hybrid";
  location: string;
  max_team_size: number;
  tech_focus: string[];
}

export default function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/hackathons");
        setHackathons(data.hackathons || []);
      } catch (error) {
        console.error("Failed to fetch hackathons:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative">
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28 sm:pt-32">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="oklch(0.82 0.18 50)" />
        <GridPattern variant="dots" fade="radial" className="opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.18),transparent_55%)]" />

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <SectionLabel className="justify-center">
              <Sparkles size={11} className="text-[var(--ember)]" />
              Teammate matching, reimagined
            </SectionLabel>
            <h1 className="mt-5 font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-balance text-foreground sm:text-[64px]">
              Find the people{" "}
              <span className="font-serif italic font-normal text-ember-gradient">
                worth building
              </span>{" "}
              your hackathon with.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px] text-pretty">
              HackMate matches you with teammates whose skills complement yours — not a room
              of strangers. Browse live hackathons, swipe on talent, and jump straight into team chat.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ShimmerButton href="#explore">
                Explore hackathons
                <ArrowRight size={14} />
              </ShimmerButton>
              <ShimmerButton href="/register" variant="ghost">
                Create an account
              </ShimmerButton>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <StatLine label="Skill-aware matching" />
              <StatLine label="Live team chat" />
              <StatLine label="Verified hackathons" />
            </div>
          </div>
        </Container>
      </section>

      {/* ─── FEATURE BENTO ───────────────────────────────── */}
      <section className="relative pb-24">
        <Container>
          <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Why HackMate</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for the way hackathons{" "}
                <span className="font-serif italic font-normal">actually</span> happen.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              No bloated profiles. No random rooms. Just a focused flow from idea to team.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
            <FeatureCard
              className="md:col-span-2 md:row-span-1"
              title="Match by complementary skill, not vibes."
              body="Our algorithm looks at stack overlap, experience level, and hackathon context — so you meet people who fill gaps instead of overlap."
              tone="ember"
              accent={
                <SkillDemo />
              }
            />
            <FeatureCard
              title="Realtime team chat."
              body="DMs and group chats with typing, read receipts, and message history. No lost threads."
              tone="mint"
              accent={<ChatDemo />}
            />
            <FeatureCard
              title="Hackathon-first."
              body="Every conversation and team lives inside a hackathon. Context stays where it belongs."
              tone="ice"
              accent={<HackathonDemo />}
            />
            <FeatureCard
              className="md:col-span-2"
              title="Lightweight, focused profiles."
              body="Skills, experience, timezone, links. Enough to know if you'd ship together — nothing that feels like a resume."
              tone="ember"
              accent={<ProfileDemo />}
            />
          </div>
        </Container>
      </section>

      {/* ─── HACKATHONS ──────────────────────────────────── */}
      <section id="explore" className="relative pb-28">
        <Container>
          <div className="flex items-end justify-between border-b border-white/[0.06] pb-6">
            <div>
              <SectionLabel>Now live</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Hackathons
              </h2>
            </div>
            <Link
              href="/hackathons"
              className="group hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Browse all
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-3xl border border-white/[0.05] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : hackathons.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No active hackathons right now — check back soon.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {hackathons.slice(0, 6).map((h) => (
                <HackathonTile key={h.id} h={h} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Atomic pieces
// ────────────────────────────────────────────────────────

function StatLine({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_oklch,var(--mint)_70%,transparent)]" />
      {label}
    </span>
  );
}

type Tone = "ember" | "mint" | "ice";
const toneMap: Record<Tone, string> = {
  ember:
    "from-[color-mix(in_oklch,var(--ember)_14%,transparent)] to-transparent",
  mint: "from-[color-mix(in_oklch,var(--mint)_14%,transparent)] to-transparent",
  ice: "from-[color-mix(in_oklch,oklch(0.65_0.14_220)_14%,transparent)] to-transparent",
};

function FeatureCard({
  title,
  body,
  accent,
  tone = "ember",
  className = "",
}: {
  title: string;
  body: string;
  accent?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br ${toneMap[tone]} p-6 transition-colors hover:border-white/[0.12] ${className}`}
    >
      <div className="absolute inset-0 -z-10 bg-white/[0.015]" />
      <div className="flex h-full flex-col gap-4">
        <div className="flex-1">
          <h3 className="max-w-sm font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl text-balance">
            {title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
        {accent && <div className="pt-2">{accent}</div>}
      </div>
    </article>
  );
}

function SkillDemo() {
  const chips = [
    { label: "React", match: 0.9 },
    { label: "Postgres", match: 0.72 },
    { label: "ML Ops", match: 0.4 },
    { label: "Figma", match: 0.85 },
    { label: "Go", match: 0.55 },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-foreground"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: `oklch(${0.6 + c.match * 0.2} ${0.14 * c.match} 40)`,
            }}
          />
          {c.label}
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {Math.round(c.match * 100)}%
          </span>
        </span>
      ))}
    </div>
  );
}

function ChatDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Bubble who="them">Hey — saw your React + DX focus, want in on DubHacks?</Bubble>
      <Bubble who="me">Down. Need backend help. Any infra folks?</Bubble>
      <Bubble who="them">I know one. Looping in.</Bubble>
    </div>
  );
}

function Bubble({ who, children }: { who: "me" | "them"; children: React.ReactNode }) {
  return (
    <div className={`flex ${who === "me" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-xs leading-snug ${
          who === "me"
            ? "rounded-tr-md bg-[color-mix(in_oklch,var(--ember)_35%,transparent)] text-white"
            : "rounded-tl-md bg-white/[0.06] text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function HackathonDemo() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] text-[10px] font-bold text-white">
        DH
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">DubHacks '26</p>
        <p className="truncate text-[11px] text-muted-foreground">Hybrid · 72h · Seattle</p>
      </div>
      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
        Open
      </span>
    </div>
  );
}

function ProfileDemo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-xs font-semibold text-white">
        JP
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Jay Patel</p>
        <p className="text-[11px] text-muted-foreground">
          Full-stack · 3yrs · UTC+5:30 · Open to remote
        </p>
      </div>
      <Link
        href="/register"
        className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[11px] text-foreground transition-colors hover:bg-white/[0.08]"
      >
        View
      </Link>
    </div>
  );
}

function HackathonTile({ h }: { h: Hackathon }) {
  const start = new Date(h.start_date);
  const end = new Date(h.end_date);
  return (
    <Link
      href={`/hackathons/${h.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.2_40/0.2),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-foreground">
          <ModeDot mode={h.mode} />
          <span className="capitalize">{h.mode}</span>
        </span>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          <span className="mx-1 text-muted-foreground/60">→</span>
          {end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-foreground group-hover:text-ember-gradient">
        {h.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {h.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {(h.tech_focus || []).slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
        {h.tech_focus && h.tech_focus.length > 3 && (
          <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground">
            +{h.tech_focus.length - 3}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          {h.mode === "online" ? <Globe2 size={13} /> : <MapPin size={13} />}
          {h.location || "Remote"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users2 size={13} />
          Up to {h.max_team_size}
        </span>
      </div>
    </Link>
  );
}

function ModeDot({ mode }: { mode: string }) {
  const color =
    mode === "online"
      ? "var(--mint)"
      : mode === "offline"
      ? "var(--ember)"
      : "oklch(0.78 0.14 80)";
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: `color-mix(in oklch, ${color} 80%, transparent)` }}
    />
  );
}
