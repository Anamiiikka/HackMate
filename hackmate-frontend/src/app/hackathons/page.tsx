"use client";

import { useEffect, useState } from "react";
import { HackathonCard, Hackathon } from "@/components/HackathonCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filters, setFilters] = useState({
    mode: "",
    location: "",
    tech_focus: "",
  });

  const fetchHackathons = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.mode) params.append("mode", filters.mode);
      if (filters.location) params.append("location", filters.location);
      if (filters.tech_focus) params.append("tech_focus", filters.tech_focus);

      const response = await api.get(`/hackathons?${params.toString()}`);
      setHackathons(response.data.hackathons);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      toast.error("Failed to load hackathons.");
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ mode: "", location: "", tech_focus: "" });
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hackathons</h1>
        <Link href="/hackathons/create" passHref>
          <Button>Create Hackathon</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg">
        <div className="flex-1">
          <label htmlFor="mode" className="block text-sm font-medium mb-1">Mode</label>
          <select id="mode" name="mode" value={filters.mode} onChange={handleFilterChange} className="w-full p-2 border rounded">
            <option value="">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
          <Input id="location" name="location" value={filters.location} onChange={handleFilterChange} placeholder="e.g., San Francisco" />
        </div>
        <div className="flex-1">
          <label htmlFor="tech_focus" className="block text-sm font-medium mb-1">Technology</label>
          <Input id="tech_focus" name="tech_focus" value={filters.tech_focus} onChange={handleFilterChange} placeholder="e.g., AI, Blockchain" />
        </div>
        <div className="flex items-end">
          <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
        </div>
      </div>

      <div>
        {hackathons.length > 0 ? (
          hackathons.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))
        ) : (
          <p>No hackathons found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
