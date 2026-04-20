"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Container, SectionLabel } from "@/components/ui/container";
import { GridPattern } from "@/components/ui/grid-pattern";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications?limit=50");
      setNotifications(response.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to update notification.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Deleted.");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch(`/notifications/read/all`);
      toast.success("All marked as read.");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark all as read.");
    }
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-24 pt-14">
      <GridPattern variant="dots" fade="radial" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.18_40/0.1),transparent_60%)]" />

      <Container className="relative max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Inbox</SectionLabel>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up."}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.08]"
            >
              <CheckCheck size={14} />
              Read all
            </button>
          )}
        </div>

        <div className="mt-8 space-y-2.5">
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
            ))
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`group relative flex items-center gap-4 rounded-2xl border border-white/[0.06] p-4 transition-colors hover:border-white/[0.12] ${
                  n.is_read ? "bg-white/[0.015]" : "bg-white/[0.03]"
                }`}
              >
                {!n.is_read && (
                  <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--ember)]" />
                )}
                <div className="ml-2 flex-1">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                      className="block text-[14px] text-foreground hover:text-ember-gradient"
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <p className="text-[14px] text-foreground">{n.message}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {timeAgo(n.created_at)} <span className="mx-1">·</span>
                    <span className="capitalize">{n.type.replace(/_/g, " ")}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="rounded-full px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground opacity-0 transition-colors hover:bg-white/[0.06] hover:text-foreground group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground">
                <Bell size={18} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">You're all caught up.</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                We'll drop a line here when something worth your attention happens.
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
