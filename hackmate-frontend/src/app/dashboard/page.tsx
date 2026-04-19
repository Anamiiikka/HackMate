"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface Match {
  user: {
    id: string;
    name: string;
    skills: any[];
  };
  score: number;
}

interface Hackathon {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMatches, setFetchingMatches] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all hackathons to populate the dropdown
    const init = async () => {
      try {
        const data = await apiFetch("/hackathons");
        setHackathons(data.hackathons || []);
        if (data.hackathons?.length > 0) {
          setSelectedHackathon(data.hackathons[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedHackathon) return;
    
    const fetchMatches = async () => {
      setFetchingMatches(true);
      setError("");
      setMatches([]);
      
      try {
        const data = await apiFetch(`/hackathons/${selectedHackathon}/recommendations?limit=10`, {
          requireAuth: true
        });
        if (data.joined === false) {
          setError(data.error);
        } else {
          setMatches(data.recommendations || []);
        }
      } catch (err: any) {
        // Fallback for other errors
        setError(err.message);
      } finally {
        setFetchingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedHackathon]);

  if (loading) return <div className="min-h-screen pt-24 text-center text-neutral-400">Loading dashboard...</div>;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
      {/* Sidebar Dropdown / Selection */}
      <div className="w-full md:w-1/4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Context</h2>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Select Hackathon Pool</label>
          <select 
            className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
          >
            {hackathons.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full md:w-3/4">
        <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md min-h-[500px]">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-2xl font-bold text-white">Recommended Teammates</h1>
            {matches.length > 0 && (
              <span className="text-sm bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full border border-violet-500/20">
                {matches.length} Matches Found
              </span>
            )}
          </div>

          {fetchingMatches ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-neutral-800/50 h-32 rounded-xl" />)}
             </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="inline-flex w-16 h-16 bg-neutral-800 rounded-full items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg text-white font-medium mb-2">{error.includes('must join') ? 'Not Joined Yet' : 'Error'}</h3>
              <p className="text-neutral-400 mb-6">{error}</p>
              {error.includes('must join') && (
                <Link href={`/hackathons/${selectedHackathon}`} className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Join Hackathon Pool
                </Link>
              )}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
              No recommendations available right now. Check back later!
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {matches.map(m => (
                 <div key={m.user.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-violet-500/30 transition-colors">
                   <div className="flex justify-between items-start mb-3">
                     <h3 className="font-semibold text-white text-lg">{m.user.name}</h3>
                     <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                       {m.score}% Match
                     </span>
                   </div>
                   
                   {/* We only render skills if the backend sends it via the matching engine */}
                   <div className="flex flex-wrap gap-2 mt-4">
                     {m.user.skills && m.user.skills.map((s: any) => (
                       <span key={s.skill_id || s.id} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-white/10">
                         {s.name || `Skill ${s.skill_id.substring(0, 4)}`}
                       </span>
                     ))}
                   </div>
                   
                   <Link href={`/users/${m.user.id}`} className="block text-center w-full mt-6 bg-white/5 hover:bg-white/10 text-white text-sm py-2 rounded-lg transition-colors border border-white/10">
                     View Profile
                   </Link>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
