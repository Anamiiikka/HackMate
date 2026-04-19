"use client";

import { useState, useEffect } from "react";
import { MatchCard, User } from "@/components/MatchCard";
import { api } from "@/lib/api";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [potentialMatches, setPotentialMatches] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skillFilter, setSkillFilter] = useState("");

  const fetchMatches = async () => {
    try {
      const params = new URLSearchParams();
      if (skillFilter) params.append("skills", skillFilter);

      const response = await api.get(`/users/potential-matches?${params.toString()}`);
      setPotentialMatches(response.data);
      setCurrentIndex(0); // Reset index when filters change
    } catch (error) {
      console.error("Error fetching potential matches:", error);
      toast.error("Failed to load potential matches.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatches();
    }, 500); // Debounce the fetch call

    return () => clearTimeout(timer);
  }, [skillFilter]);

  const handleAccept = async (userId: number) => {
    try {
      // Assuming you have an endpoint to send an accept request
      await api.post('/requests/send', { receiverId: userId });
      toast.success("Request sent!");
      showNextUser();
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request.");
    }
  };

  const handleReject = (userId: number) => {
    // Just move to the next user for now
    showNextUser();
  };

  const showNextUser = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Toaster />
      <h1 className="text-3xl font-bold mb-4">Find Your Hackmate</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Discover and connect with talented developers.</p>
      
      <div className="w-full max-w-sm mb-6">
        <Input
          type="text"
          placeholder="Filter by skills (e.g., React, Node.js)..."
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="w-full max-w-sm">
        {potentialMatches.length > 0 && currentIndex < potentialMatches.length ? (
          <MatchCard
            user={potentialMatches[currentIndex]}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="font-semibold">No more potential matches right now.</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
