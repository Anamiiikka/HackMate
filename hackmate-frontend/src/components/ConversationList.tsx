"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message: {
    content: string;
    created_at: string;
  };
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
        setConversations(response.data.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>
      <div>
        {conversations.map((convo) => (
          <div
            key={convo.id}
            className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => onSelectConversation(convo.id)}
          >
            <Avatar className="mr-4">
              <AvatarImage src={convo.participant.avatar_url} alt={convo.participant.name} />
              <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-semibold">{convo.participant.name}</p>
              <p className="text-sm text-gray-500 truncate">{convo.last_message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
