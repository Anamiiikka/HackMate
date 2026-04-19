"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string;
  skills: string[];
  avatar_url?: string;
}

interface MatchCardProps {
  user: User;
  onAccept: (userId: number) => void;
  onReject: (userId: number) => void;
}

export function MatchCard({ user, onAccept, onReject }: MatchCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user.avatar_url} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.name}</CardTitle>
        <p className="text-sm text-gray-500">@{user.username}</p>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-4">{user.bio}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {user.skills.map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-around">
        <Button variant="outline" className="border-red-500 text-red-500" onClick={() => onReject(user.id)}>Reject</Button>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => onAccept(user.id)}>Accept</Button>
      </CardFooter>
    </Card>
  );
}
