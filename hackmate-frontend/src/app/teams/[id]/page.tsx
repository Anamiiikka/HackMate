"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster, toast } from "sonner";
import { User } from "@/components/MatchCard"; // Reusing this interface for member details
import { Button } from "@/components/ui/button";

interface TeamMember extends User {
  role: 'leader' | 'member';
}

interface TeamDetails {
  id: string;
  name: string;
  hackathon_id: string;
  created_by: string;
  members: TeamMember[];
}

export default function TeamDetailPage() {
  const params = useParams();
  const { id } = params;
  const [team, setTeam] = useState<TeamDetails | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTeamDetails = async () => {
        try {
          const response = await api.get(`/teams/${id}`);
          setTeam(response.data.team);
        } catch (error) {
          console.error("Error fetching team details:", error);
          toast.error("Failed to load team details.");
        }
      };

      fetchTeamDetails();
    }
  }, [id]);

  if (!team) {
    return <div>Loading team details...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">{team.name}</CardTitle>
          <CardDescription>A team for Hackathon ID: {team.hackathon_id}</CardDescription>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6 flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={member.avatar_url} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500 capitalize">{member.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Placeholder for future actions */}
      <div className="mt-8 flex space-x-2">
          <Button variant="destructive">Leave Team</Button>
          {/* Add logic to show the following button only to team leaders */}
          {/* <Button variant="outline">Manage Team</Button> */}
      </div>
    </div>
  );
}
