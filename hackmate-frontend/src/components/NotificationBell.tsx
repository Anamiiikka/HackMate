"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get("/notifications?limit=5"),
        api.get("/notifications/count/unread"),
      ]);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(countRes.data.unread_count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notificationId: string, link: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="space-y-2 p-4">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      notif.is_read
                        ? "bg-gray-100 dark:bg-slate-700"
                        : "bg-blue-50 dark:bg-blue-900"
                    }`}
                    onClick={() => handleNotificationClick(notif.id, notif.link)}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 p-4">No notifications</p>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <Link href="/notifications" className="block">
              <Button variant="outline" className="w-full">
                View All
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
