"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Participant {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'team';
  participants: Participant[];
  last_message?: {
    content: string;
    created_at: string;
  } | null;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get("/conversations");
        setConversations(response.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>
      <div className="space-y-2">
        {conversations.map((convo) => {
          // Fallback if no participants found (though should always have at least one other)
          const participant = convo.participants[0] || { name: "Team Chat", avatar_url: "" };
          
          return (
            <div
              key={convo.id}
              className="flex items-center p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all border border-transparent hover:border-white/10"
              onClick={() => onSelectConversation(convo.id)}
            >
              <Avatar className="h-12 w-12 mr-4 ring-2 ring-white/5">
                <AvatarImage src={participant.avatar_url} alt={participant.name} />
                <AvatarFallback className="bg-violet-600 text-white font-medium">
                  {participant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="font-semibold text-neutral-100 truncate">
                    {convo.type === 'team' ? `Team: ${participant.name}` : participant.name}
                  </p>
                  {convo.last_message && (
                    <span className="text-[10px] text-neutral-500 uppercase font-medium">
                      {new Date(convo.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-400 truncate">
                  {convo.last_message ? convo.last_message.content : "No messages yet"}
                </p>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div className="text-center py-10">
            <p className="text-neutral-500 text-sm italic">No conversations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
