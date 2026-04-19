"use client";

import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { useState } from "react";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <ConversationList onSelectConversation={setSelectedConversationId} />
      </div>
      <div className="w-3/4">
        {selectedConversationId ? (
          <ChatWindow conversationId={selectedConversationId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
