"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, apiFetch } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  Send,
} from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";

interface Skill {
  id: number | string;
  name: string;
  category: string;
  proficiency: number;
}

interface UserProfile {
  id: string;
  name: string;
  bio: string | null;
  experience_level: string;
  github_url: string | null;
  linkedin_url: string | null;
  timezone: string | null;
  location: string | null;
  avatar_url: string | null;
  skills: Skill[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUserId(JSON.parse(userStr).id);
      } catch {}
    }

    (async () => {
      try {
        const data = await apiFetch(`/users/${id}`, { requireAuth: true });
        setProfile(data.user);
      } catch (err: any) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleMessage = async () => {
    if (!profile || messaging) return;
    setMessaging(true);
    try {
      const res = await api.post("/conversations", { participant_id: profile.id });
      if (res?.conversation_id) router.push(`/chat?c=${res.conversation_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to open conversation");
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h3 className="font-display text-2xl font-semibold">Profile not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This user doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.name || "User";
  const initials =
    displayName
      .split(" ")
      .map((n) => n.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const isOwn = currentUserId === profile.id;

  const skillsByCategory = (profile.skills || []).reduce<Record<string, Skill[]>>(
    (acc, s) => {
      const k = s.category || "Other";
      acc[k] = acc[k] || [];
      acc[k].push(s);
      return acc;
    },
    {},
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pb-24 pt-12">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.12),transparent_60%)]" />

      <Container className="relative">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <section className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-card/70 p-8 shadow-soft backdrop-blur-sm md:p-10">
          <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.18),transparent_60%)]" />

          <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] p-[2px] shadow-ember">
              <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[var(--ink-1)] text-3xl font-semibold text-white">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                    {displayName}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-0.5 text-[11px] font-medium capitalize">
                      <span className="h-1.5 w-1.5 rounded-full bg-[color-mix(in_oklch,var(--mint)_80%,transparent)]" />
                      {profile.experience_level || "Beginner"}
                    </span>
                    {profile.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} />
                        {profile.location}
                      </span>
                    )}
                    {profile.timezone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} />
                        {profile.timezone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.github_url && (
                    <SocialIcon href={profile.github_url} label="GitHub">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </SocialIcon>
                  )}
                  {profile.linkedin_url && (
                    <SocialIcon href={profile.linkedin_url} label="LinkedIn">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </SocialIcon>
                  )}
                </div>
              </div>

              <p className="mt-6 max-w-2xl rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                {profile.bio || "This user hasn't added a bio yet."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionLabel>Skills & expertise</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            What {displayName.split(" ")[0]} brings
          </h2>

          {profile.skills && profile.skills.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {Object.entries(skillsByCategory).map(([cat, arr]) => (
                <div
                  key={cat}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {cat}
                  </p>
                  <ul className="space-y-2.5">
                    {arr.map((skill) => (
                      <li key={skill.id} className="flex items-center justify-between gap-3">
                        <span className="text-[14px] text-foreground">{skill.name}</span>
                        <span className="flex gap-1" aria-label={`Proficiency ${skill.proficiency} of 5`}>
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <span
                              key={lvl}
                              className={`h-1.5 w-4 rounded-full ${
                                lvl <= skill.proficiency
                                  ? "bg-[color-mix(in_oklch,var(--ember)_70%,transparent)]"
                                  : "bg-white/[0.06]"
                              }`}
                            />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-white/[0.08] px-6 py-10 text-center text-sm text-muted-foreground">
              No skills listed.
            </p>
          )}
        </section>

        <section className="mt-10 flex flex-wrap justify-end gap-3">
          {isOwn ? (
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-white/[0.08]"
            >
              Edit profile
            </Link>
          ) : (
            <>
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-white/[0.08] disabled:opacity-60"
              >
                <MessageSquare size={14} />
                {messaging ? "Opening…" : "Message"}
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-5 py-2.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px">
                <Send size={14} />
                Send team request
              </button>
            </>
          )}
        </section>
      </Container>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
    >
      {children}
      <ExternalLink size={10} className="absolute -right-0.5 -top-0.5 opacity-0" />
    </Link>
  );
}
