"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatSocketProvider } from "@/lib/chat-socket";
import { MessageSquare } from "lucide-react";

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("c");

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initial);

  // Keep state in sync if the URL changes (e.g. user clicks a deep link).
  useEffect(() => {
    if (initial && initial !== selectedConversationId) {
      setSelectedConversationId(initial);
    }
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (id: string) => {
    setSelectedConversationId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("c", id);
    router.replace(`/chat?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 max-w-sm border-r border-white/[0.06] bg-background/60">
        <ConversationList
          selectedId={selectedConversationId}
          onSelectConversation={handleSelect}
        />
      </div>
      <div className="flex-1">
        {selectedConversationId ? (
          <ChatWindow
            key={selectedConversationId}
            conversationId={selectedConversationId}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03]">
              <MessageSquare size={18} />
            </div>
            <p className="mt-4 text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatSocketProvider>
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-neutral-500">
            Loading…
          </div>
        }
      >
        <ChatPageInner />
      </Suspense>
    </ChatSocketProvider>
  );
}
