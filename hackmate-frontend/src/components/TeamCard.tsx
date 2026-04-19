"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Team {
  id: string;
  name: string;
  hackathon_id: string;
  // We can add more details like members count later
}

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>For Hackathon ID: {team.hackathon_id}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={`/teams/${team.id}`} passHref>
          <Button>View Team</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
