"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, X, CheckCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) return;

      const [notifRes, countRes] = await Promise.all([
        api.get("/notifications?limit=5"),
        api.get("/notifications/count/unread"),
      ]);
      setNotifications(notifRes.notifications || []);
      setUnreadCount(countRes.unread_count || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch(`/notifications/read/all`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-[17px] w-[17px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--ember)] px-1 text-[10px] font-bold text-white shadow-ember">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-40 mt-2 w-[360px] origin-top-right overflow-hidden rounded-2xl border border-white/[0.08] bg-popover/95 shadow-soft backdrop-blur-xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <p className="text-[11px] text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  >
                    <CheckCheck size={12} />
                    Read all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length > 0 ? (
                <ul className="p-1.5">
                  {notifications.map((notif) => (
                    <li key={notif.id}>
                      {notif.link ? (
                        <Link
                          href={notif.link}
                          onClick={() => handleNotificationClick(notif.id)}
                          className={cn(
                            "group relative block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.06]",
                            !notif.is_read && "bg-white/[0.03]",
                          )}
                        >
                          <NotificationRow notif={notif} />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleNotificationClick(notif.id)}
                          className={cn(
                            "group relative block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]",
                            !notif.is_read && "bg-white/[0.03]",
                          )}
                        >
                          <NotificationRow notif={notif} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">Nothing here yet.</p>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] p-2">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationRow({ notif }: { notif: Notification }) {
  return (
    <>
      {!notif.is_read && (
        <span className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--ember)]" />
      )}
      <p className="pl-3 text-[13px] leading-snug text-foreground">{notif.message}</p>
      <p className="pl-3 mt-0.5 text-[11px] text-muted-foreground">
        {timeAgo(notif.created_at)}
      </p>
    </>
  );
}
