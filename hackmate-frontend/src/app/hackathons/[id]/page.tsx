"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Hackathon } from "@/components/HackathonCard";
import { Toaster, toast } from "sonner";
import { Calendar, MapPin, Users, Globe, Trophy, Info, FileText, CheckCircle, ExternalLink, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      const fetchHackathon = async () => {
        try {
          const response = await apiFetch(`/hackathons/${id}`);
          setHackathon(response.hackathon);
        } catch (error) {
          console.error("Error fetching hackathon:", error);
          toast.error("Failed to load hackathon details.");
        } finally {
          setLoading(false);
        }
      };

      fetchHackathon();
    }
  }, [id]);

  const handleJoin = async () => {
    try {
      await apiFetch(`/hackathons/${id}/join`, {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ seriousness_level: "serious" })
      });
      toast.success("Successfully joined the hackathon pool!");
    } catch (error: any) {
      console.error("Error joining hackathon:", error);
      toast.error(error.message || "Failed to join hackathon.");
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 text-center text-neutral-400">Loading hackathon...</div>;
  }

  if (!hackathon) {
    return <div className="min-h-screen pt-24 text-center text-red-400">Hackathon not found.</div>;
  }

  const isOnline = hackathon.mode === "online";
  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "prizes", label: "Prizes", icon: Trophy },
    { id: "rules", label: "Rules", icon: FileText },
    { id: "schedule", label: "Schedule", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Toaster theme="dark" />
      
      {/* Hero Header */}
      <div className="relative pt-24 pb-12 w-full overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-indigo-900/20 to-black pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <button 
            onClick={() => router.back()}
            className="text-neutral-400 hover:text-white mb-6 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} /> Back
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex gap-3 items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                  ${isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                             : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'}`}
                >
                  {hackathon.mode}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-neutral-300">
                  Featured
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-4">
                {hackathon.name}
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed">
                {hackathon.description.split('.')[0]}. Join the ultimate challenge to push the boundaries of technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 mb-8 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                      ${isActive 
                        ? 'border-violet-500 text-white bg-violet-500/5' 
                        : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm min-h-[400px]">
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h3 className="text-xl font-semibold mb-4 text-white">About the Hackathon</h3>
                    <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {hackathon.description}
                    </p>
                  </section>

                  {hackathon.tech_focus && hackathon.tech_focus.length > 0 && (
                    <section>
                      <h3 className="text-xl font-semibold mb-4 text-white">Tech Focus</h3>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.tech_focus.map((tech, i) => (
                          <span key={i} className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/5">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "prizes" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-semibold text-white mb-2">Simulated Prize Categories</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
                      <div className="text-amber-400 font-bold text-2xl mb-1">1st Place</div>
                      <div className="text-4xl text-white font-extrabold mb-3">$10,000</div>
                      <p className="text-amber-200/70 text-sm">Plus exclusive mentorship and fast-track interviews.</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-400/20 to-slate-500/10 border border-slate-400/30 rounded-2xl p-6">
                      <div className="text-slate-300 font-bold text-2xl mb-1">2nd Place</div>
                      <div className="text-4xl text-white font-extrabold mb-3">$5,000</div>
                      <p className="text-slate-300/70 text-sm">Premium software licenses and gear.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rules" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-semibold text-white">General Rules</h3>
                  <ul className="space-y-4">
                    {[
                      "All code must be written during the hackathon period.",
                      "Teams must consist of the specified limits.",
                      "Use of open source libraries is permitted and encouraged.",
                      "Your project must align with the thematic tracks.",
                      "Be respectful and follow the code of conduct."
                    ].map((rule, idx) => (
                      <li key={idx} className="flex gap-3 text-neutral-300 items-start">
                        <CheckCircle className="text-violet-500 shrink-0 mt-0.5" size={20} />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-semibold text-white">Event Timeline</h3>
                  <div className="border-l border-white/10 ml-3 space-y-6 pb-4">
                    <div className="relative pl-8">
                      <div className="absolute w-3 h-3 bg-violet-500 rounded-full -left-1.5 top-1.5 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                      <div className="text-sm text-violet-400 font-medium mb-1">{new Date(hackathon.start_date).toLocaleDateString()}</div>
                      <div className="text-white font-semibold text-lg">Hacking Begins</div>
                      <div className="text-neutral-400 text-sm">Opening ceremony and team formation.</div>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute w-3 h-3 bg-neutral-600 rounded-full -left-1.5 top-1.5" />
                      <div className="text-sm text-neutral-400 font-medium mb-1">Midpoint</div>
                      <div className="text-white font-semibold text-lg">Check-ins & Mentoring</div>
                      <div className="text-neutral-400 text-sm">Progress reviews with mentors.</div>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-1.5 top-1.5 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      <div className="text-sm text-emerald-400 font-medium mb-1">{new Date(hackathon.end_date).toLocaleDateString()}</div>
                      <div className="text-white font-semibold text-lg">Submissions Close</div>
                      <div className="text-neutral-400 text-sm">Final presentations and judging.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Quick Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                <button 
                  onClick={handleJoin}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-4 px-6 rounded-2xl mb-6 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex justify-center items-center gap-2 text-lg"
                >
                  Join Hackathon
                </button>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Calendar className="text-violet-400" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Dates</div>
                      <div className="font-medium text-white">{new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <MapPin className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Location</div>
                      <div className="font-medium text-white capitalize">{hackathon.location}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Users className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400">Team Size</div>
                      <div className="font-medium text-white">{hackathon.min_team_size || 2} - {hackathon.max_team_size || 4} members</div>
                    </div>
                  </div>

                  {hackathon.website_url && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Globe className="text-pink-400" size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-neutral-400">Website</div>
                        <Link href={hackathon.website_url} target="_blank" className="font-medium text-white flex items-center gap-1 hover:text-pink-400 transition-colors">
                          Visit Site <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
