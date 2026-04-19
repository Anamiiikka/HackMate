"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface RequestUser {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Request {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  from_user?: RequestUser; // Present in incoming requests
  to_user?: RequestUser;   // Present in outgoing requests
  created_at: string;
}

interface RequestCardProps {
  request: Request;
  type: 'incoming' | 'outgoing';
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

export function RequestCard({ request, type, onAccept, onReject, onCancel }: RequestCardProps) {
  const user = type === 'incoming' ? request.from_user : request.to_user;

  if (!user) {
    return null; // Or some fallback UI
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <CardTitle>{user.name}</CardTitle>
            <p className="text-sm text-gray-500">
              {type === 'incoming' ? 'Wants to connect with you' : 'You sent a request'}
            </p>
          </div>
          <Badge variant={request.status === 'pending' ? 'default' : request.status === 'accepted' ? 'secondary' : 'destructive'}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-end space-x-2">
        {type === 'incoming' && request.status === 'pending' && onAccept && onReject && (
          <>
            <Button variant="outline" onClick={() => onReject(request.id)}>Reject</Button>
            <Button onClick={() => onAccept(request.id)}>Accept</Button>
          </>
        )}
        {type === 'outgoing' && request.status === 'pending' && onCancel && (
          <Button variant="destructive" onClick={() => onCancel(request.id)}>Cancel</Button>
        )}
      </CardFooter>
    </Card>
  );
}
