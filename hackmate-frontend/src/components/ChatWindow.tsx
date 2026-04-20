"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Get current user info from localStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {}
    }

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(response.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Initialize socket connection with auth token
    // Using port 5000 directly for the socket connection
    socketRef.current = io("http://localhost:5000", {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('📡 Connected to chat server');
      socketRef.current?.emit("join_conversation", { conversation_id: conversationId });
    });

    socketRef.current.on("new_message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on('error', (err: any) => {
      console.error('❌ Socket error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        conversation_id: conversationId,
        content: newMessage.trim(),
      };
      socketRef.current.emit("send_message", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 overflow-hidden relative">
      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-grow p-6 overflow-y-auto space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 px-4 rounded-2xl relative group transition-all ${
                msg.sender_id === userId 
                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-violet-900/10" 
                : "bg-neutral-800 text-neutral-100 rounded-tl-none border border-white/5"
              }`}
            >
              <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
              <span className={`text-[10px] opacity-40 block mt-1 ${msg.sender_id === userId ? "text-right" : "text-left"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white/10 mb-4 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="italic text-sm">No messages yet. Send a greeting!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-900/80 backdrop-blur-md border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex space-x-3 items-center max-w-5xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-black/40 border-white/10 rounded-2xl h-12 px-6 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-neutral-600"
          />
          <Button 
            type="submit"
            className="bg-white text-black hover:bg-neutral-200 font-bold rounded-2xl h-12 px-8 transition-transform active:scale-95 shadow-xl shadow-white/5"
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
