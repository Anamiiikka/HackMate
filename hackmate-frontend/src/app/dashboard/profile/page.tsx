"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Toaster, toast } from "sonner";
import { Save, User, MapPin, Link as LinkIcon, Globe, Clock, ChevronLeft } from "lucide-react";

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
    const fetchProfile = async () => {
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
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 text-center text-neutral-400">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <Toaster theme="dark" />
      <div className="container mx-auto px-6 max-w-4xl">
        
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-neutral-400 hover:text-white mb-6 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-neutral-900/40 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start mb-10 pb-10 border-b border-white/10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-black shrink-0 overflow-hidden shadow-xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">Edit Profile</h1>
              <p className="text-neutral-400">Manage your public persona and connection details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300">Avatar URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User size={18} />
                  </div>
                  <input
                    type="url"
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-600"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">Experience Level</label>
                <select
                  name="experience_level"
                  value={profile.experience_level}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">Timezone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Clock size={18} />
                  </div>
                  <input
                    type="text"
                    name="timezone"
                    value={profile.timezone}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="e.g. Asia/Kolkata or UTC"
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">GitHub Profile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Globe size={18} />
                  </div>
                  <input
                    type="url"
                    name="github_url"
                    value={profile.github_url}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">LinkedIn Profile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={profile.linkedin_url}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="block text-sm font-medium text-neutral-300">Bio / Description</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={5}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y"
                placeholder="Tell us about yourself, your skills, and what kind of teams you're looking for..."
              />
            </div>

            {/* Submit */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
