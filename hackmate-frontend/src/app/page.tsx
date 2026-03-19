"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface Hackathon {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  mode: string;
  location: string;
  max_team_size: number;
  tech_focus: string[];
}

export default function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const data = await apiFetch("/hackathons");
        setHackathons(data.hackathons || []);
      } catch (error) {
        console.error("Failed to fetch hackathons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-violet-300 text-sm font-medium tracking-wide">
            HackMate 2.0 is live
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            Find your perfect <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              hackathon team.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Stop rolling the dice on teammates. Our algorithm connects you with complementary skills, aligned goals, and matched seriousness levels.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="#explore" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-colors">
              Explore Hackathons
            </Link>
            <Link href="/register" className="bg-white/5 text-white border border-white/10 px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Hackathons Grid */}
      <section id="explore" className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Active Hackathons</h2>
          {/* Filters could go here later */}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-neutral-900/50 border border-white/5 rounded-2xl h-64" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            No active hackathons found at the moment.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((h) => (
              <Link 
                href={`/hackathons/${h.id}`} 
                key={h.id}
                className="group relative bg-neutral-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-neutral-800/60 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                    {h.mode}
                  </span>
                  <span className="text-neutral-500 text-xs font-mono">
                    {new Date(h.start_date).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-200 transition-colors">
                  {h.name}
                </h3>
                <p className="text-neutral-400 text-sm line-clamp-2 mb-6">
                  {h.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {h.tech_focus && h.tech_focus.slice(0, 3).map(tech => (
                    <span key={tech} className="px-2 py-1 rounded-md bg-white/5 text-neutral-300 text-xs">
                      {tech}
                    </span>
                  ))}
                  {h.tech_focus && h.tech_focus.length > 3 && (
                    <span className="px-2 py-1 rounded-md bg-white/5 text-neutral-500 text-xs">
                      +{h.tech_focus.length - 3}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
