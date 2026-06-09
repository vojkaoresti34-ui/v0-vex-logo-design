"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  CheckCircle2, 
  Eye, 
  AlertCircle,
  Sparkles,
  Zap,
  MoreHorizontal,
  Loader2
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to mark all as read");
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const handleMarkRead = async (id: string, currentReadState: boolean) => {
    setActiveMenuId(null);
    if (currentReadState) return; // already read

    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH"
      });

      if (!res.ok) throw new Error("Failed to mark notification as read");
    } catch (err) {
      console.error(err);
      fetchNotifications();
    }
  };

  const getIconProps = (type: string) => {
    switch (type.toLowerCase()) {
      case "success":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" };
      case "activity":
        return { icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "ai":
        return { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" };
      case "alert":
        return { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "system":
      default:
        return { icon: Sparkles, color: "text-primary", bg: "bg-primary/10" };
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Bell className="w-7 h-7" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-[#111] flex items-center justify-center text-[8px] font-black text-white">
                  {unreadCount}
                </div>
              )}
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">Notifications</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">Stay updated on your application status and AI activities in real-time.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm flex flex-col items-center justify-center min-h-[400px] text-secondary/40">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-bold">Synchronizing notifications from Neon cloud database...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm flex flex-col items-center justify-center min-h-[400px] text-rose-500 font-bold text-center p-8">
          <p>Failed to load alerts: {error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-[#222] shadow text-primary' : 'text-secondary/60 dark:text-white/60 hover:text-secondary'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'unread' ? 'bg-white dark:bg-[#222] shadow text-primary' : 'text-secondary/60 dark:text-white/60 hover:text-secondary'}`}
              >
                Unread
              </button>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm font-bold text-primary hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filtered.map((notification) => {
                const props = getIconProps(notification.type);
                const Icon = props.icon;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    key={notification.id}
                    className={`p-6 border-b border-black/5 dark:border-white/5 flex items-start gap-4 transition-colors group relative ${!notification.isRead ? 'bg-primary/[0.02]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${props.bg}`}>
                      <Icon className={`w-6 h-6 ${props.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-base leading-tight truncate pr-4 ${!notification.isRead ? 'font-black text-secondary dark:text-white' : 'font-bold text-secondary/80 dark:text-white/80'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs font-bold text-secondary/50 dark:text-white/50 shrink-0 ml-4">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-secondary/70 dark:text-white/70 leading-relaxed pr-12">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <button 
                          onClick={() => handleMarkRead(notification.id, false)}
                          className="w-2.5 h-2.5 rounded-full bg-primary"
                          title="Mark as read"
                        />
                      )}
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === notification.id ? null : notification.id)}
                          className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-secondary/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeMenuId === notification.id && (
                          <div className="absolute right-0 top-6 bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 shadow-2xl rounded-xl p-2 z-50 w-32">
                            <button
                              onClick={() => handleMarkRead(notification.id, notification.isRead)}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-primary/5 hover:text-primary transition-colors text-secondary dark:text-white"
                            >
                              Mark as Read
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-black mb-2">You're all caught up!</h3>
                <p className="text-sm font-medium text-secondary/50 dark:text-white/50 max-w-xs">No new notifications right now. Check back later for updates on your applications.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
