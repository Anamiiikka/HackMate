"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Users, Code, CheckCircle, Shield, Star, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_premium: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "hackathons">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hackathon form state
  const [hName, setHName] = useState("");
  const [hDescription, setHDescription] = useState("");
  const [hStartDate, setHStartDate] = useState("");
  const [hEndDate, setHEndDate] = useState("");
  const [hMode, setHMode] = useState("online");
  const [hLocation, setHLocation] = useState("");
  const [hMaxTeamSize, setHMaxTeamSize] = useState(4);
  const [hMinTeamSize, setHMinTeamSize] = useState(2);
  const [hWebsiteUrl, setHWebsiteUrl] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/login");
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        if (!user.is_admin) {
          router.push("/");
          return;
        }
        
        const data = await api.get("/admin/users");
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminAndFetch();
  }, [router]);

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const data = await api.patch(`/admin/users/${userId}/premium`, {
        is_premium: !currentStatus
      });
      setUsers(users.map(u => u.id === userId ? { ...u, is_premium: !currentStatus } : u));
    } catch (err) {
      console.error("Failed to update premium status", err);
      alert("Failed to update premium status");
    }
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSuccessMsg("");
    try {
      await api.post("/admin/hackathons", {
        name: hName,
        description: hDescription,
        start_date: hStartDate,
        end_date: hEndDate,
        mode: hMode,
        location: hLocation,
        max_team_size: hMaxTeamSize,
        min_team_size: hMinTeamSize,
        website_url: hWebsiteUrl
      });
      setSuccessMsg("Hackathon created successfully!");
      setHName(""); setHDescription(""); setHStartDate(""); setHEndDate(""); 
      setHMode("online"); setHLocation(""); setHMaxTeamSize(4); setHMinTeamSize(2); setHWebsiteUrl("");
    } catch (err: any) {
      alert(err.message || "Failed to create hackathon");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center pt-16">Loading...</div>;
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="text-[var(--ember)]" size={32} />
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
        </div>

        <div className="mb-8 flex gap-4 border-b border-white/[0.08]">
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative",
              activeTab === "users" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users size={16} />
            Manage Users
            {activeTab === "users" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ember)] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("hackathons")}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative",
              activeTab === "hackathons" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code size={16} />
            List Hackathon
            {activeTab === "hackathons" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ember)] rounded-t-full" />
            )}
          </button>
        </div>

        {activeTab === "users" && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-foreground">
                <thead className="border-b border-white/[0.08] bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 font-medium text-muted-foreground">User</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Email</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Joined</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground text-right">Premium Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {users.map(u => (
                    <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{u.name}</span>
                          {u.is_admin && <Shield size={14} className="text-[var(--ember)]" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => togglePremium(u.id, u.is_premium)}
                          disabled={u.is_admin}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                            u.is_premium 
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                              : "bg-white/[0.03] text-muted-foreground border border-white/[0.08] hover:bg-white/[0.08]",
                            u.is_admin && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {u.is_premium ? <Star size={12} className="fill-amber-500" /> : <Star size={12} />}
                          {u.is_premium ? "Premium" : "Free"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "hackathons" && (
          <div className="max-w-2xl rounded-2xl border border-white/[0.08] bg-card p-6 shadow-soft sm:p-8">
            <h2 className="mb-6 text-xl font-semibold text-foreground">List a New Hackathon</h2>
            
            {successMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500 border border-green-500/20">
                <CheckCircle size={18} />
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleCreateHackathon} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Hackathon Name</label>
                <input
                  type="text"
                  required
                  value={hName}
                  onChange={(e) => setHName(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  placeholder="e.g. Global AI Hackathon"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={hDescription}
                  onChange={(e) => setHDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  placeholder="Describe the hackathon..."
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Start Date</label>
                  <input
                    type="date"
                    required
                    value={hStartDate}
                    onChange={(e) => setHStartDate(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">End Date</label>
                  <input
                    type="date"
                    required
                    value={hEndDate}
                    onChange={(e) => setHEndDate(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Mode</label>
                  <select
                    value={hMode}
                    onChange={(e) => setHMode(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Location (if offline/hybrid)</label>
                  <input
                    type="text"
                    value={hLocation}
                    onChange={(e) => setHLocation(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Min Team Size</label>
                  <input
                    type="number"
                    min={1}
                    value={hMinTeamSize}
                    onChange={(e) => setHMinTeamSize(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Max Team Size</label>
                  <input
                    type="number"
                    min={1}
                    value={hMaxTeamSize}
                    onChange={(e) => setHMaxTeamSize(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Website URL</label>
                <input
                  type="url"
                  value={hWebsiteUrl}
                  onChange={(e) => setHWebsiteUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--ember)] focus:outline-none focus:ring-1 focus:ring-[var(--ember)]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded-xl bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.68_0.2_25))] px-4 py-3 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {submitLoading ? "Creating..." : "Create Hackathon"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
