"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

export default function CreateHackathonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState<"online" | "offline" | "hybrid">("online");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/hackathons", {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        location,
        mode,
      });
      toast.success("Hackathon created.");
      router.push("/hackathons");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create hackathon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24 pt-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.12),transparent_60%)]" />

      <Container className="relative max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <SectionLabel>New hackathon</SectionLabel>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Host a <span className="font-serif italic font-normal">hackathon</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Details show up on the explore page as soon as you save.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm"
        >
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="DubHacks '26"
              className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </Field>
          <Field label="Description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Short pitch for hackers"
              className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Start date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground focus:outline-none [color-scheme:dark]"
              />
            </Field>
            <Field label="End date">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground focus:outline-none [color-scheme:dark]"
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Seattle, WA or Online"
              className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Mode
            </span>
            <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              {(["online", "offline", "hybrid"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-full px-3 py-2 text-[12px] font-medium capitalize transition-colors ${
                    mode === m
                      ? "bg-white/[0.08] text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-5 py-2.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Creating…</>
              ) : (
                <><Plus size={14} /> Create hackathon</>
              )}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 transition-all focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]">
        {children}
      </span>
    </label>
  );
}
