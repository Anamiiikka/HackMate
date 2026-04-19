"use client";

import { useEffect, useState } from "react";
import { TeamCard, Team } from "@/components/TeamCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Toaster, toast } from "sonner";

export default function MyTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        const response = await api.get("/teams");
        setTeams(response.data.teams);
      } catch (error) {
        console.error("Error fetching my teams:", error);
        toast.error("Failed to load your teams.");
      }
    };

    fetchMyTeams();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <Link href="/teams/create" passHref>
          <Button>Create New Team</Button>
        </Link>
      </div>
      <div>
        {teams.length > 0 ? (
          teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="font-semibold mb-2">You are not part of any teams yet.</p>
            <p className="text-gray-500 mb-4">Why not create one?</p>
            <Link href="/teams/create" passHref>
              <Button>Create a Team</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
