"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUserId(u.id);
      } catch (e) {}
    }

    const fetchProfile = async () => {
      try {
        const data = await apiFetch(`/users/${id}`, { requireAuth: true });
        setProfile(data.user);
      } catch (err: any) {
        setError(err.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-24 text-center text-neutral-400">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center">
        <div className="text-center bg-neutral-900/40 border border-white/10 rounded-2xl p-10 backdrop-blur-md max-w-lg">
          <div className="inline-flex w-16 h-16 bg-neutral-800 rounded-full items-center justify-center mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="text-xl text-white font-medium mb-2">Profile Not Found</h3>
          <p className="text-neutral-400 mb-6">{error || "This user does not exist or has been removed."}</p>
          <button 
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-white/10"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={() => router.back()}
        className="text-neutral-400 hover:text-white mb-8 flex items-center gap-2 transition-colors cursor-pointer"
      >
        ← Back
      </button>

      <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar / Initials */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl flex-shrink-0">
            {profile.avatar_url ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
               profile.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                  <span className="capitalize bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {profile.experience_level || "Beginner"}
                  </span>
                  {profile.location && <span>📍 {profile.location}</span>}
                  {profile.timezone && <span>🕒 {profile.timezone}</span>}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {profile.github_url && (
                  <Link href={profile.github_url} target="_blank" className="bg-neutral-800 hover:bg-neutral-700 text-white p-2.5 rounded-xl transition-colors border border-white/5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </Link>
                )}
                {profile.linkedin_url && (
                  <Link href={profile.linkedin_url} target="_blank" className="bg-neutral-800 hover:bg-neutral-700 text-white p-2.5 rounded-xl transition-colors border border-white/5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </Link>
                )}
              </div>
            </div>

            <p className="text-neutral-300 leading-relaxed mt-6 bg-black/30 p-5 rounded-2xl border border-white/5">
              {profile.bio || "This user hasn't added a bio yet."}
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Skills & Expertise</h2>
          
          {profile.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{skill.name}</span>
                    <span className="text-xs bg-white/10 text-neutral-300 px-2 py-1 rounded-md">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-auto pt-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1.5 flex-1 rounded-full ${level <= skill.proficiency ? 'bg-violet-500' : 'bg-neutral-800'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-neutral-500 italic bg-black/20 p-6 rounded-xl text-center border border-white/5">
              No skills listed.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-10 flex justify-end gap-4">
          {currentUserId === profile.id ? (
            <Link href="/dashboard/profile" className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-8 rounded-xl transition-all border border-white/10">
              Edit Profile
            </Link>
          ) : (
            <button className="bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Send Team Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
