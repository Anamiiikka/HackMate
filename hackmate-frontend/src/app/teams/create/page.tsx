"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Hackathon } from "@/components/HackathonCard";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hackathonId, setHackathonId] = useState("");
  const [availableHackathons, setAvailableHackathons] = useState<Hackathon[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/hackathons");
        setAvailableHackathons(response.hackathons);
      } catch (error) {
        console.error("Error fetching hackathons:", error);
        toast.error("Could not load hackathons.");
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackathonId) {
      toast.error("Please select a hackathon.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/teams", { name, hackathon_id: hackathonId });
      toast.success("Team created.");
      router.push("/teams");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create team.");
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

        <SectionLabel>New team</SectionLabel>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Create a <span className="font-serif italic font-normal">team</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a hackathon, name your team, and invite people from your matches.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-soft backdrop-blur-sm"
        >
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Hackathon
            </span>
            <span className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 transition-all focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]">
              <select
                value={hackathonId}
                onChange={(e) => setHackathonId(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground focus:outline-none"
                required
              >
                <option value="" disabled className="bg-[var(--ink-1)]">Select a hackathon</option>
                {availableHackathons.map((h) => (
                  <option key={h.id} value={h.id} className="bg-[var(--ink-1)]">
                    {h.name}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Team name
            </span>
            <span className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 transition-all focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="The Late Pushers"
                className="w-full bg-transparent py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </span>
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-5 py-2.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Creating…</>
              ) : (
                <><Plus size={14} /> Create team</>
              )}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
