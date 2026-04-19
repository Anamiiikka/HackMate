"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Toaster, toast } from "sonner";

export default function CreateHackathonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState<"online" | "offline" | "hybrid">("online");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/hackathons", {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        location,
        mode,
      });
      toast.success("Hackathon created successfully!");
      router.push("/hackathons");
    } catch (error) {
      console.error("Error creating hackathon:", error);
      toast.error("Failed to create hackathon.");
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Toaster />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Hackathon</CardTitle>
          <CardDescription>Fill in the details below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="start-date" className="block text-sm font-medium mb-1">Start Date</label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="w-1/2">
                <label htmlFor="end-date" className="block text-sm font-medium mb-1">End Date</label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Online, San Francisco" required />
            </div>
            <div>
              <label htmlFor="mode" className="block text-sm font-medium mb-1">Mode</label>
              <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-full p-2 border rounded">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Create Hackathon</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
