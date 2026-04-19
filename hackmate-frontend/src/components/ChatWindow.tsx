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
  // A placeholder for the current user's ID. In a real app, you'd get this from your auth context.
  const currentUserId = "current-user-id-placeholder"; 

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Initialize socket connection
    socketRef.current = io("http://localhost:3001"); // Make sure this matches your backend socket server URL

    socketRef.current.emit("joinConversation", conversationId);

    socketRef.current.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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
        conversationId,
        content: newMessage,
        senderId: currentUserId, // This needs to be the actual user ID
      };
      socketRef.current.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"} mb-4`}
          >
            <div
              className={`p-3 rounded-lg ${
                msg.sender_id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
