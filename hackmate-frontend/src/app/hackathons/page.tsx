"use client";

import { useEffect, useState } from "react";
import { HackathonCard, Hackathon } from "@/components/HackathonCard";
import { api } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Plus, Search } from "lucide-react";

type Mode = "" | "online" | "offline" | "hybrid";

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ mode: Mode; location: string; tech_focus: string }>({
    mode: "",
    location: "",
    tech_focus: "",
  });

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.mode) params.append("mode", filters.mode);
      if (filters.location) params.append("location", filters.location);
      if (filters.tech_focus) params.append("tech_focus", filters.tech_focus);

      const response = await api.get(`/hackathons?${params.toString()}`);
      setHackathons(response.hackathons);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast.error("Failed to load hackathons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const modes: { value: Mode; label: string }[] = [
    { value: "", label: "All" },
    { value: "online", label: "Online" },
    { value: "offline", label: "In person" },
    { value: "hybrid", label: "Hybrid" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24 pt-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.1),transparent_60%)]" />

      <Container className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Discover</SectionLabel>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Hackathons
            </h1>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Browse what's happening, filter by stack or location, and join the pool to start matching.
            </p>
          </div>
          <Link
            href="/hackathons/create"
            className="inline-flex items-center gap-2 self-start rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-4 py-2.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px"
          >
            <Plus size={14} />
            Create hackathon
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 md:flex-row md:items-center">
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            {modes.map((m) => (
              <button
                key={m.label}
                onClick={() => setFilters((f) => ({ ...f, mode: m.value }))}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  filters.mode === m.value
                    ? "bg-white/[0.08] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)]">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              placeholder="Location"
              className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)]">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={filters.tech_focus}
              onChange={(e) => setFilters((f) => ({ ...f, tech_focus: e.target.value }))}
              placeholder="Tech focus (e.g. AI, Web3)"
              className="flex-1 bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          {(filters.mode || filters.location || filters.tech_focus) && (
            <button
              onClick={() => setFilters({ mode: "", location: "", tech_focus: "" })}
              className="rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-3xl border border-white/[0.05] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : hackathons.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {hackathons.map((h) => (
                <HackathonCard key={h.id} hackathon={h} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No hackathons match those filters.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
