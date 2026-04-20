"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Hackathon } from "@/components/HackathonCard";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ExternalLink,
  FileText,
  Globe,
  Info,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "prizes" | "rules" | "schedule">("overview");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await apiFetch(`/hackathons/${id}`);
        setHackathon(response.hackathon);
      } catch (error) {
        console.error("Error fetching hackathon:", error);
        toast.error("Failed to load hackathon details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await apiFetch(`/hackathons/${id}/join`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ seriousness_level: "serious" }),
      });
      toast.success("You're in. Head to your dashboard to start matching.");
    } catch (error: any) {
      toast.error(error.message || "Failed to join hackathon.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading hackathon…
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Hackathon not found.
      </div>
    );
  }

  const start = new Date(hackathon.start_date);
  const end = new Date(hackathon.end_date);

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "prizes", label: "Prizes", icon: Trophy },
    { id: "rules", label: "Rules", icon: FileText },
    { id: "schedule", label: "Schedule", icon: Calendar },
  ] as const;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.16),transparent_60%)]" />

      {/* Hero */}
      <section className="relative pt-14 pb-10">
        <Container className="relative">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <SectionLabel>Hackathon</SectionLabel>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            {hackathon.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {hackathon.description.split(".")[0]}.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-0.5 text-[11px] font-medium capitalize text-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    hackathon.mode === "online"
                      ? "color-mix(in oklch, var(--mint) 80%, transparent)"
                      : hackathon.mode === "offline"
                      ? "color-mix(in oklch, var(--ember) 80%, transparent)"
                      : "oklch(0.78 0.14 80)",
                }}
              />
              {hackathon.mode}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-0.5 text-[11px] text-muted-foreground">
              <Calendar size={11} />
              {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              <span className="mx-0.5">→</span>
              {end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-0.5 text-[11px] text-muted-foreground">
              <MapPin size={11} />
              {hackathon.location}
            </span>
          </div>
        </Container>
      </section>

      <Container className="relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="flex gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium transition-colors ${
                      active
                        ? "bg-white/[0.08] text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 min-h-[360px] rounded-3xl border border-white/[0.06] bg-card/60 p-7 shadow-soft backdrop-blur-sm">
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fade-up">
                  <section>
                    <h3 className="font-display text-lg font-semibold tracking-tight">About</h3>
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground text-pretty">
                      {hackathon.description}
                    </p>
                  </section>
                  {hackathon.tech_focus && hackathon.tech_focus.length > 0 && (
                    <section>
                      <h3 className="font-display text-lg font-semibold tracking-tight">Tech focus</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {hackathon.tech_focus.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[12px] text-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
              {activeTab === "prizes" && (
                <div className="animate-fade-up">
                  <h3 className="font-display text-lg font-semibold tracking-tight">Prize pool</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <PrizeTier tier="1st place" amount="$10,000" note="Mentorship + fast-track interviews." tone="ember" />
                    <PrizeTier tier="2nd place" amount="$5,000" note="Premium licenses and gear." tone="mint" />
                  </div>
                </div>
              )}
              {activeTab === "rules" && (
                <div className="animate-fade-up">
                  <h3 className="font-display text-lg font-semibold tracking-tight">The fine print</h3>
                  <ul className="mt-4 space-y-3 text-[14px] text-muted-foreground">
                    {[
                      "All code must be written during the hackathon window.",
                      "Team sizes must respect the posted limits.",
                      "Open-source libraries are welcome and encouraged.",
                      "Submissions must align with the posted themes.",
                      "Be a decent human — follow the code of conduct.",
                    ].map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle size={14} className="mt-0.5 shrink-0 text-[color-mix(in_oklch,var(--mint)_85%,white)]" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === "schedule" && (
                <div className="animate-fade-up">
                  <h3 className="font-display text-lg font-semibold tracking-tight">Timeline</h3>
                  <ol className="mt-5 space-y-5 border-l border-white/[0.08] pl-5">
                    <TimelineItem
                      date={start.toLocaleDateString()}
                      title="Hacking begins"
                      body="Opening ceremony and team formation."
                      color="var(--ember)"
                    />
                    <TimelineItem
                      date="Midpoint"
                      title="Check-ins & mentoring"
                      body="Progress reviews with mentors."
                      color="oklch(0.6 0.01 60)"
                    />
                    <TimelineItem
                      date={end.toLocaleDateString()}
                      title="Submissions close"
                      body="Final presentations and judging."
                      color="var(--mint)"
                    />
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] py-3.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-60"
                >
                  {joining ? "Joining…" : "Join hackathon"}
                </button>

                <div className="mt-6 space-y-4 text-sm">
                  <SidebarRow icon={<Calendar size={14} />} label="Dates">
                    {start.toLocaleDateString()} – {end.toLocaleDateString()}
                  </SidebarRow>
                  <SidebarRow icon={<MapPin size={14} />} label="Location">
                    <span className="capitalize">{hackathon.location}</span>
                  </SidebarRow>
                  <SidebarRow icon={<Users size={14} />} label="Team size">
                    {hackathon.min_team_size || 2} – {hackathon.max_team_size || 4} members
                  </SidebarRow>
                  {hackathon.website_url && (
                    <SidebarRow icon={<Globe size={14} />} label="Website">
                      <Link
                        href={hackathon.website_url}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-ember-gradient"
                      >
                        Visit <ExternalLink size={11} />
                      </Link>
                    </SidebarRow>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function SidebarRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.06] bg-white/[0.03] text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[13px] text-foreground">{children}</p>
      </div>
    </div>
  );
}

function PrizeTier({
  tier,
  amount,
  note,
  tone,
}: {
  tier: string;
  amount: string;
  note: string;
  tone: "ember" | "mint";
}) {
  const tint =
    tone === "ember"
      ? "from-[color-mix(in_oklch,var(--ember)_16%,transparent)]"
      : "from-[color-mix(in_oklch,var(--mint)_16%,transparent)]";
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${tint} to-transparent p-5`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{tier}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{amount}</p>
      <p className="mt-2 text-[12px] text-muted-foreground">{note}</p>
    </div>
  );
}

function TimelineItem({
  date,
  title,
  body,
  color,
}: {
  date: string;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <li className="relative">
      <span
        className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-[3px] border-background"
        style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}` }}
      />
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{date}</p>
      <p className="mt-0.5 font-display text-base font-semibold">{title}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{body}</p>
    </li>
  );
}
