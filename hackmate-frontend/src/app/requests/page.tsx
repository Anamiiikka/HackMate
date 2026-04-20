"use client";

import { useEffect, useState } from "react";
import { RequestCard, Request } from "@/components/RequestCard";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Inbox } from "lucide-react";

type Tab = "incoming" | "outgoing";

export default function RequestsPage() {
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);
  const [tab, setTab] = useState<Tab>("incoming");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing"),
      ]);
      setIncoming(incomingRes.requests);
      setOutgoing(outgoingRes.requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "accepted" });
      toast.success("Request accepted.");
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.message || "Failed to accept request.");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}`, { status: "rejected" });
      toast.success("Request declined.");
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.message || "Failed to decline request.");
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await api.delete(`/requests/${requestId}`);
      toast.success("Request cancelled.");
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel request.");
    }
  };

  const pendingIncoming = incoming.filter((r) => r.status === "pending").length;
  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24 pt-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.1),transparent_60%)]" />

      <Container className="relative max-w-3xl">
        <SectionLabel>Connect</SectionLabel>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Requests
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Incoming hands from potential teammates, and the pings you've sent out.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
          {([
            { id: "incoming", label: `Incoming${pendingIncoming ? ` · ${pendingIncoming}` : ""}` },
            { id: "outgoing", label: "Outgoing" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                tab === t.id
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
            ))
          ) : list.length > 0 ? (
            list.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                type={tab}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground">
                <Inbox size={18} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">Nothing here.</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                {tab === "incoming"
                  ? "When someone wants to team up, they'll show up here."
                  : "Requests you send will appear here until they're answered."}
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
