"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useChatSocket } from "@/lib/chat-socket";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";

interface Participant {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface LastMessage {
  id: string;
  content: string;
  created_at: string;
  sender?: { id: string; name: string } | null;
}

interface Conversation {
  id: string;
  type: "direct" | "team";
  participants: Participant[];
  last_message?: LastMessage | null;
  unread_count?: number;
}

interface ConversationListProps {
  selectedId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export function ConversationList({
  selectedId,
  onSelectConversation,
}: ConversationListProps) {
  const { socket, currentUserId } = useChatSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/conversations");
        if (!cancelled) setConversations(res.conversations || []);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Live updates
  useEffect(() => {
    if (!socket) return;

    const onUpdated = ({
      conversation_id,
      last_message,
      increment_unread,
    }: {
      conversation_id: string;
      last_message: LastMessage;
      increment_unread: boolean;
    }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversation_id);
        if (idx === -1) {
          // Conversation was created elsewhere; fetch fresh list.
          api
            .get("/conversations")
            .then((res: { conversations?: Conversation[] }) =>
              setConversations(res.conversations || []),
            )
            .catch(() => {});
          return prev;
        }
        const next = [...prev];
        const current = next[idx];
        const isOpen = selectedId === conversation_id;
        next[idx] = {
          ...current,
          last_message,
          unread_count:
            increment_unread && !isOpen
              ? (current.unread_count || 0) + 1
              : current.unread_count || 0,
        };
        // Move to top
        const [bumped] = next.splice(idx, 1);
        return [bumped, ...next];
      });
    };

    const onRead = ({ conversation_id }: { conversation_id: string }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation_id ? { ...c, unread_count: 0 } : c
        )
      );
    };

    socket.on("conversation_updated", onUpdated);
    socket.on("conversation_read", onRead);

    return () => {
      socket.off("conversation_updated", onUpdated);
      socket.off("conversation_read", onRead);
    };
  }, [socket, selectedId]);

  // Zero unread when a conversation becomes the selected one
  useEffect(() => {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
    );
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const label =
        c.participants[0]?.name?.toLowerCase() ||
        (c.type === "team" ? "team chat" : "");
      const lm = c.last_message?.content?.toLowerCase() || "";
      return label.includes(q) || lm.includes(q);
    });
  }, [conversations, search]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/[0.06]">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">Conversations</h2>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="bg-white/[0.02] border-white/[0.08] rounded-xl h-10 focus:border-[color-mix(in_oklch,var(--ember)_40%,transparent)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Loading…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">
              {conversations.length === 0
                ? "No conversations yet."
                : "No matches."}
            </p>
          </div>
        )}

        <div className="space-y-1">
          {filtered.map((convo) => {
            const rawParticipant =
              convo.participants[0] || { name: "Team Chat", avatar_url: null };
            const participant = {
              ...rawParticipant,
              name: rawParticipant.name || "Unknown",
            };
            const isSelected = convo.id === selectedId;
            const unread = convo.unread_count || 0;
            const lm = convo.last_message;
            const lmPreview = lm
              ? lm.sender?.id === currentUserId
                ? `You: ${lm.content}`
                : lm.content
              : "No messages yet";

            return (
              <button
                key={convo.id}
                type="button"
                onClick={() => onSelectConversation(convo.id)}
                className={`w-full text-left flex items-center p-3 cursor-pointer rounded-xl transition-all border ${
                  isSelected
                    ? "bg-white/[0.05] border-white/[0.1]"
                    : "border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]"
                }`}
              >
                <Avatar className="h-11 w-11 mr-3.5 flex-shrink-0">
                  <AvatarImage src={participant.avatar_url || undefined} alt={participant.name} />
                  <AvatarFallback className="bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-white font-medium">
                    {participant.name.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5 gap-2">
                    <p
                      className={`truncate text-[14px] ${
                        unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"
                      }`}
                    >
                      {convo.type === "team"
                        ? `Team: ${participant.name}`
                        : participant.name}
                    </p>
                    {lm && (
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground flex-shrink-0">
                        {formatTime(lm.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[12.5px] truncate flex-1 ${
                        unread > 0 ? "text-foreground/90" : "text-muted-foreground"
                      }`}
                    >
                      {lmPreview}
                    </p>
                    {unread > 0 && (
                      <span className="text-[10px] min-w-[18px] h-[18px] px-1.5 rounded-full bg-[var(--ember)] text-white font-bold flex items-center justify-center shadow-ember">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
