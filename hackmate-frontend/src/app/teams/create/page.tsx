"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Toaster, toast } from "sonner";
import { Hackathon } from "@/components/HackathonCard";

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hackathonId, setHackathonId] = useState("");
  const [availableHackathons, setAvailableHackathons] = useState<Hackathon[]>([]);

  useEffect(() => {
    // Fetch hackathons that the user can create a team for
    const fetchHackathons = async () => {
      try {
        const response = await api.get("/hackathons");
        setAvailableHackathons(response.hackathons);
      } catch (error) {
        console.error("Error fetching hackathons:", error);
        toast.error("Could not load hackathons.");
      }
    };
    fetchHackathons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackathonId) {
      toast.error("Please select a hackathon.");
      return;
    }
    try {
      await api.post("/teams", {
        name,
        hackathon_id: hackathonId,
      });
      toast.success("Team created successfully!");
      router.push("/teams");
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team. You might already be in a team for this hackathon.");
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Toaster />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Team</CardTitle>
          <CardDescription>Choose a hackathon and give your team a name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="hackathon" className="block text-sm font-medium mb-1">Hackathon</label>
              <select
                id="hackathon"
                value={hackathonId}
                onChange={(e) => setHackathonId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="" disabled>Select a hackathon</option>
                {availableHackathons.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Team Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Create Team</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
