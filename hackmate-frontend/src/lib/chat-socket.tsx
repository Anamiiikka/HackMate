"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "http://localhost:5000");

type Status = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface ChatSocketContextValue {
  socket: Socket | null;
  status: Status;
  currentUserId: string | null;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({
  socket: null,
  status: "idle",
  currentUserId: null,
});

export function ChatSocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUserId(JSON.parse(userStr).id);
      } catch {}
    }
    if (!token) return;

    setStatus("connecting");

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => setStatus("connected"));
    s.on("disconnect", () => setStatus("disconnected"));
    s.on("connect_error", () => setStatus("error"));

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setStatus("idle");
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={{ socket, status, currentUserId }}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  return useContext(ChatSocketContext);
}
