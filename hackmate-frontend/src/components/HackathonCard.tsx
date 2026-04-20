"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  max_team_size?: number;
  min_team_size?: number;
  tech_focus?: string[];
  website_url?: string;
}

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{hackathon.name}</CardTitle>
        <CardDescription>
          {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{hackathon.description}</p>
        <div className="flex items-center space-x-2">
          <Badge>{hackathon.mode}</Badge>
          <span>{hackathon.location}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/hackathons/${hackathon.id}`} passHref>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
