"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestCard, Request } from "@/components/RequestCard";
import { api } from "@/lib/api";
import { Toaster, toast } from "sonner";

export default function RequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing"),
      ]);
      setIncomingRequests(incomingRes.data.requests);
      setOutgoingRequests(outgoingRes.data.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: 'accepted' });
      toast.success("Request accepted!");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request.");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: 'rejected' });
      toast.success("Request rejected!");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request.");
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await api.delete(`/requests/${requestId}`);
      toast.success("Request cancelled!");
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Connection Requests</h1>
      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">Incoming ({incomingRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          {incomingRequests.length > 0 ? (
            incomingRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                type="incoming"
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          ) : (
            <p className="mt-4">No incoming requests.</p>
          )}
        </TabsContent>
        <TabsContent value="outgoing">
          {outgoingRequests.length > 0 ? (
            outgoingRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                type="outgoing"
                onCancel={handleCancel}
              />
            ))
          ) : (
            <p className="mt-4">No outgoing requests.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
