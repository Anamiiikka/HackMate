"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useChatSocket } from "@/lib/chat-socket";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

interface Sender {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  sender: Sender;
  client_id?: string | null;
  pending?: boolean;
  failed?: boolean;
}

interface ChatWindowProps {
  conversationId: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const sameDay = (a: string, b: string) =>
  new Date(a).toDateString() === new Date(b).toDateString();

const dateLabel = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
};

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { socket, status, currentUserId } = useChatSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Reset state when switching conversations
  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setHasMore(false);
    setTypingUsers({});
    didInitialScroll.current = false;
  }, [conversationId]);

  // Load history + join room
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}/messages?limit=50`);
        if (cancelled) return;
        setMessages(res.messages || []);
        setHasMore(Boolean(res.has_more));
      } catch (err: any) {
        if (!cancelled) toast.error(err.message || "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    if (!socket) return () => { cancelled = true; };

    socket.emit("join_conversation", { conversation_id: conversationId });
    socket.emit("mark_read", { conversation_id: conversationId });

    return () => {
      cancelled = true;
      socket.emit("leave_conversation", { conversation_id: conversationId });
    };
  }, [conversationId, socket]);

  // Re-join on reconnect
  useEffect(() => {
    if (!socket) return;
    const onConnect = () => {
      socket.emit("join_conversation", { conversation_id: conversationId });
      socket.emit("mark_read", { conversation_id: conversationId });
    };
    socket.on("connect", onConnect);
    return () => { socket.off("connect", onConnect); };
  }, [socket, conversationId]);

  // Incoming events
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (m: Message) => {
      if (m.conversation_id !== conversationId) return;

      setMessages((prev) => {
        // Reconcile optimistic message via client_id
        if (m.client_id) {
          const idx = prev.findIndex((p) => p.client_id === m.client_id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...m, pending: false, failed: false };
            return next;
          }
        }
        if (prev.some((p) => p.id === m.id)) return prev;
        return [...prev, m];
      });

      // Auto-mark incoming as read when window is focused
      if (m.sender.id !== currentUserId && typeof document !== "undefined" && !document.hidden) {
        socket.emit("mark_read", { conversation_id: conversationId });
      }
    };

    const onTyping = ({
      conversation_id,
      user_id,
      name,
    }: { conversation_id: string; user_id: string; name: string }) => {
      if (conversation_id !== conversationId) return;
      setTypingUsers((prev) => ({ ...prev, [user_id]: name }));
    };

    const onStoppedTyping = ({
      conversation_id,
      user_id,
    }: { conversation_id: string; user_id: string }) => {
      if (conversation_id !== conversationId) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[user_id];
        return next;
      });
    };

    const onMessagesRead = ({
      conversation_id,
      message_ids,
      read_at,
    }: { conversation_id: string; message_ids: string[]; read_at: string }) => {
      if (conversation_id !== conversationId) return;
      const set = new Set(message_ids);
      setMessages((prev) =>
        prev.map((m) => (set.has(m.id) ? { ...m, read_at } : m))
      );
    };

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);
    socket.on("user_stopped_typing", onStoppedTyping);
    socket.on("messages_read", onMessagesRead);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stopped_typing", onStoppedTyping);
      socket.off("messages_read", onMessagesRead);
    };
  }, [socket, conversationId, currentUserId]);

  // Mark-read when tab becomes visible again
  useEffect(() => {
    if (!socket) return;
    const onVisible = () => {
      if (!document.hidden) {
        socket.emit("mark_read", { conversation_id: conversationId });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [socket, conversationId]);

  // Scroll to bottom: initially, and on new bottom messages if already near bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!didInitialScroll.current && messages.length > 0) {
      el.scrollTop = el.scrollHeight;
      didInitialScroll.current = true;
      return;
    }

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;

    try {
      const oldest = messages[0].created_at;
      const res = await api.get(
        `/conversations/${conversationId}/messages?limit=50&before=${encodeURIComponent(oldest)}`
      );
      const older: Message[] = res.messages || [];
      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        return [...older.filter((m) => !existing.has(m.id)), ...prev];
      });
      setHasMore(Boolean(res.has_more));

      // Preserve scroll anchor
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMore, loadingOlder, messages]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop < 60) loadOlder();
  };

  const stopTyping = useCallback(() => {
    if (!socket || !isTypingRef.current) return;
    socket.emit("typing_stop", { conversation_id: conversationId });
    isTypingRef.current = false;
  }, [socket, conversationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!socket) return;
    if (value.trim() && !isTypingRef.current) {
      socket.emit("typing_start", { conversation_id: conversationId });
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !socket) return;

    if (content.length > 2000) {
      toast.error("Message too long (max 2000 chars)");
      return;
    }

    const client_id =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`);

    const optimistic: Message = {
      id: `temp-${client_id}`,
      conversation_id: conversationId,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: {
        id: currentUserId || "",
        name: "",
        avatar_url: null,
      },
      client_id,
      pending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    stopTyping();

    socket.emit(
      "send_message",
      { conversation_id: conversationId, content, client_id },
      (resp: { ok?: boolean; message?: Message; error?: string }) => {
        if (resp?.ok && resp.message) {
          setMessages((prev) =>
            prev.map((m) =>
              m.client_id === client_id ? { ...resp.message!, pending: false } : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.client_id === client_id ? { ...m, pending: false, failed: true } : m
            )
          );
          const errMap: Record<string, string> = {
            rate_limited: "You're sending messages too fast. Slow down.",
            too_long: "Message too long (max 2000 chars).",
            forbidden: "You're not a participant in this conversation.",
            empty: "Message is empty.",
            server: "Could not send message. Try again.",
          };
          toast.error(errMap[resp?.error || "server"] || "Could not send message");
        }
      }
    );
  };

  const typingList = useMemo(() => Object.values(typingUsers), [typingUsers]);

  // Group messages by day + consecutive sender
  const rendered = useMemo(() => {
    const items: Array<
      | { kind: "date"; label: string; key: string }
      | { kind: "message"; msg: Message; showMeta: boolean; key: string }
    > = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const prev = messages[i - 1];
      if (!prev || !sameDay(prev.created_at, m.created_at)) {
        items.push({ kind: "date", label: dateLabel(m.created_at), key: `d-${m.id}` });
      }
      const showMeta =
        !prev ||
        prev.sender.id !== m.sender.id ||
        !sameDay(prev.created_at, m.created_at) ||
        new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000;
      items.push({ kind: "message", msg: m, showMeta, key: m.id });
    }
    return items;
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {status !== "connected" && status !== "idle" && (
        <div className="absolute top-0 left-0 right-0 text-center py-1.5 text-xs bg-amber-500/10 text-amber-300 border-b border-amber-500/20 z-10">
          {status === "connecting" && "Connecting…"}
          {status === "disconnected" && "Reconnecting…"}
          {status === "error" && "Connection error. Retrying…"}
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-grow p-6 overflow-y-auto space-y-2 scroll-smooth"
      >
        {loadingOlder && (
          <div className="text-center text-xs text-muted-foreground py-2">Loading older…</div>
        )}

        {loading && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Loading conversation…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white/10 mb-4 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="italic text-sm">No messages yet. Say hi!</p>
          </div>
        )}

        {rendered.map((item) => {
          if (item.kind === "date") {
            return (
              <div key={item.key} className="flex justify-center my-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/[0.05] px-3 py-1 rounded-full">
                  {item.label}
                </span>
              </div>
            );
          }
          const msg = item.msg;
          const isMine = msg.sender.id === currentUserId;
          const lastMine =
            isMine &&
            item === rendered[rendered.length - 1] &&
            !msg.pending &&
            !msg.failed;

          return (
            <div
              key={item.key}
              className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
            >
              {!isMine && (
                <div className="w-7 h-7 flex-shrink-0">
                  {item.showMeta && (
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={msg.sender.avatar_url || undefined} alt={msg.sender.name} />
                      <AvatarFallback className="bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-white text-xs">
                        {msg.sender.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {item.showMeta && !isMine && (
                  <span className="text-[11px] text-muted-foreground mb-0.5 ml-1">
                    {msg.sender.name}
                  </span>
                )}
                <div
                  className={`p-3 px-4 rounded-2xl relative group transition-all ${
                    isMine
                      ? `bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] text-white ${
                          item.showMeta ? "rounded-tr-none" : "rounded-tr-2xl"
                        } shadow-ember ${
                          msg.pending ? "opacity-60" : ""
                        } ${msg.failed ? "ring-2 ring-red-500/60" : ""}`
                      : `bg-white/[0.05] text-foreground ${
                          item.showMeta ? "rounded-tl-none" : "rounded-tl-2xl"
                        } border border-white/5`
                  }`}
                >
                  <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground ${
                    isMine ? "pr-1" : "pl-1"
                  }`}
                >
                  <span>{formatTime(msg.created_at)}</span>
                  {isMine && msg.pending && <span>• sending…</span>}
                  {isMine && msg.failed && (
                    <span className="text-red-400">• failed</span>
                  )}
                  {lastMine && msg.read_at && (
                    <span className="text-[color-mix(in_oklch,var(--ember)_90%,white)]">• seen</span>
                  )}
                  {lastMine && !msg.read_at && !msg.pending && !msg.failed && (
                    <span>• sent</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {typingList.length > 0 && (
        <div className="px-6 pb-1 text-xs text-muted-foreground italic">
          {typingList.length === 1
            ? `${typingList[0]} is typing…`
            : `${typingList.join(", ")} are typing…`}
        </div>
      )}

      <div className="border-t border-white/[0.06] bg-background/85 p-4 backdrop-blur-md">
        <form onSubmit={sendMessage} className="mx-auto flex max-w-5xl items-center space-x-3">
          <Input
            value={input}
            onChange={handleChange}
            onBlur={stopTyping}
            placeholder="Type your message…"
            maxLength={2000}
            className="h-12 flex-1 rounded-2xl border-white/[0.08] bg-white/[0.02] px-5 transition-all placeholder:text-muted-foreground/60 focus:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus:ring-2 focus:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]"
          />
          <Button
            type="submit"
            className="h-12 rounded-2xl bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-6 font-medium text-white shadow-ember transition-transform hover:-translate-y-px active:translate-y-0"
            disabled={!input.trim() || !socket || status !== "connected"}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
