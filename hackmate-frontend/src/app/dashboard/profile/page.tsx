"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClockIcon,
  Globe,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Save,
  User as UserIcon,
} from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  experience_level: string;
  github_url: string;
  linkedin_url: string;
  location: string;
  timezone: string;
  avatar_url: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    experience_level: "beginner",
    github_url: "",
    linkedin_url: "",
    location: "",
    timezone: "UTC",
    avatar_url: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/users/me", { requireAuth: true });
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
            experience_level: data.user.experience_level || "beginner",
            github_url: data.user.github_url || "",
            linkedin_url: data.user.linkedin_url || "",
            location: data.user.location || "",
            timezone: data.user.timezone || "UTC",
            avatar_url: data.user.avatar_url || "",
          });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/users/me", {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({
          bio: profile.bio,
          experience_level: profile.experience_level,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          location: profile.location,
          timezone: profile.timezone,
          avatar_url: profile.avatar_url,
        }),
      });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  const initials = (profile.name || "").charAt(0).toUpperCase() || "?";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden pb-24 pt-12">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.12),transparent_60%)]" />

      <Container className="relative max-w-3xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </button>

        <header className="mb-10">
          <SectionLabel>Account</SectionLabel>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your <span className="font-serif italic font-normal">profile</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep your stack and links up to date — this is what potential teammates see.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] p-[2px] shadow-ember">
                <div className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[var(--ink-1)] text-2xl font-semibold text-white">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Field label="Avatar URL" icon={<UserIcon size={14} />}>
                  <input
                    type="url"
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={handleChange}
                    className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="grid gap-5 rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm md:grid-cols-2">
            <Field label="Experience level">
              <select
                name="experience_level"
                value={profile.experience_level}
                onChange={handleChange}
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground focus:outline-none"
              >
                <option value="beginner" className="bg-[var(--ink-1)]">Beginner</option>
                <option value="intermediate" className="bg-[var(--ink-1)]">Intermediate</option>
                <option value="advanced" className="bg-[var(--ink-1)]">Advanced</option>
              </select>
            </Field>

            <Field label="Timezone" icon={<ClockIcon size={14} />}>
              <input
                type="text"
                name="timezone"
                value={profile.timezone}
                onChange={handleChange}
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                placeholder="Asia/Kolkata"
              />
            </Field>

            <Field label="Location" icon={<MapPin size={14} />} className="md:col-span-2">
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                placeholder="San Francisco, CA"
              />
            </Field>
          </section>

          <section className="grid gap-5 rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm md:grid-cols-2">
            <Field label="GitHub" icon={<Globe size={14} />}>
              <input
                type="url"
                name="github_url"
                value={profile.github_url}
                onChange={handleChange}
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                placeholder="https://github.com/username"
              />
            </Field>
            <Field label="LinkedIn" icon={<LinkIcon size={14} />}>
              <input
                type="url"
                name="linkedin_url"
                value={profile.linkedin_url}
                onChange={handleChange}
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                placeholder="https://linkedin.com/in/username"
              />
            </Field>
          </section>

          <section className="rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Bio
              </span>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]"
                placeholder="Tell us about yourself, your stack, and the kind of teams you want to build with…"
              />
            </label>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-6 py-3 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  className = "",
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 transition-all focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {children}
      </span>
    </label>
  );
}
