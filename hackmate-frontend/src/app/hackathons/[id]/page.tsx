"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Hackathon {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  mode: string;
  location: string;
  tech_focus: string[];
}

export default function HackathonDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Join form state
  const [preferredRole, setPreferredRole] = useState("");
  const [seriousness, setSeriousness] = useState("serious");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await apiFetch("/hackathons");
        const found = data.hackathons.find((h: Hackathon) => h.id === id);
        if (found) setHackathon(found);
      } catch (e) {
        console.error("Failed to load hackathon", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    setError("");
    
    try {
      await apiFetch(`/hackathons/${id}/join`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          preferred_role: preferredRole,
          seriousness_level: seriousness,
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Please login to join this hackathon.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center text-neutral-400">Loading...</div>;
  if (!hackathon) return <div className="min-h-screen pt-24 text-center text-neutral-400">Hackathon not found.</div>;

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{hackathon.name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
          <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">{hackathon.mode}</span>
          <span>Starts: {new Date(hackathon.start_date).toLocaleDateString()}</span>
          <span>Ends: {new Date(hackathon.end_date).toLocaleDateString()}</span>
        </div>
        <p className="mt-6 text-lg text-neutral-300 leading-relaxed max-w-3xl">
          {hackathon.description}
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm max-w-2xl shadow-2xl">
        <h2 className="text-2xl font-semibold text-white mb-6">Join Participant Pool</h2>
        
        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-4 rounded-xl flex items-center gap-3">
             <span className="text-xl">✅</span> Successfully joined! Redirecting to matches...
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-6">
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Preferred Role</label>
              <input 
                type="text" 
                placeholder="e.g. Frontend Developer, UX Designer"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none"
                value={preferredRole}
                onChange={e => setPreferredRole(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Seriousness Level</label>
              <select
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all outline-none appearance-none cursor-pointer"
                value={seriousness}
                onChange={e => setSeriousness(e.target.value)}
              >
                <option value="casual">Casual (Learning & Fun)</option>
                <option value="serious">Serious (Building a full product)</option>
                <option value="win_focused">Win Focused (In it for the prize)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={joining}
              className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-500 transition-colors disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              {joining ? "Joining..." : "Join & Get Recommendations"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
