"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Hackathon } from "@/components/HackathonCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

export default function HackathonDetailPage() {
  const params = useParams();
  const { id } = params;
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);

  useEffect(() => {
    if (id) {
      const fetchHackathon = async () => {
        try {
          const response = await api.get(`/hackathons/${id}`);
          setHackathon(response.data.hackathon);
        } catch (error) {
          console.error("Error fetching hackathon:", error);
          toast.error("Failed to load hackathon details.");
        }
      };

      fetchHackathon();
    }
  }, [id]);

  const handleJoin = async () => {
    try {
      // Assuming you have an endpoint to join a hackathon
      await api.post(`/hackathons/${id}/join`);
      toast.success("Successfully joined the hackathon!");
    } catch (error) {
      console.error("Error joining hackathon:", error);
      toast.error("Failed to join hackathon.");
    }
  };

  if (!hackathon) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold">{hackathon.name}</CardTitle>
          <CardDescription>
            {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6">{hackathon.description}</p>
          <div className="flex items-center space-x-4 mb-6">
            <Badge>{hackathon.mode}</Badge>
            <span className="text-gray-500">{hackathon.location}</span>
          </div>
          <Button onClick={handleJoin}>Join Hackathon</Button>
        </CardContent>
      </Card>
    </div>
  );
}
