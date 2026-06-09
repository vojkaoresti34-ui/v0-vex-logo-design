"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  Send,
  Star,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface Sender {
  id: string;
  name: string;
  image?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: Sender;
}

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Conversation {
  id: string;
  title?: string;
  updatedAt: string;
  members: Member[];
  last_message?: {
    id: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New message box state
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Active SSE stream source ref
  const sseRef = useRef<EventSource | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchChannels();
    return () => {
      if (sseRef.current) sseRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data || []);

      if (data && data.length > 0) {
        setActiveId(data[0].id);
      }
      
      // Fetch active user ID dynamically from session
      const sessRes = await fetch("/api/auth/session");
      if (sessRes.ok) {
        const sess = await sessRes.json();
        setCurrentUserId(sess?.user?.id || null);
      }

      // Initialize Real-time SSE Sync
      initSSE();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/messages?conversationId=${channelId}&limit=50`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const initSSE = () => {
    if (sseRef.current) sseRef.current.close();

    const sse = new EventSource("/api/messages/stream");
    sseRef.current = sse;

    sse.addEventListener("message", (e: any) => {
      try {
        const messageObj = JSON.parse(e.data);
        
        // Append message to timeline if it belongs to active chat
        setMessages(prev => {
          if (prev.some(m => m.id === messageObj.id)) return prev;
          if (messageObj.conversationId === activeId) {
            return [...prev, messageObj];
          }
          return prev;
        });

        // Trigger dynamic conversation lists updates to refresh last messages and unread counts
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === messageObj.conversationId) {
              return {
                ...conv,
                last_message: {
                  id: messageObj.id,
                  content: messageObj.content,
                  createdAt: messageObj.createdAt
                },
                unreadCount: activeId === conv.id ? 0 : conv.unreadCount + 1
              };
            }
            return conv;
          });
        });
      } catch (err) {
        console.warn("Error parsing incoming SSE message event", err);
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeId || sending) return;

    try {
      setSending(true);
      const messageText = inputText;
      setInputText("");

      // Optimistic append
      const tempId = Math.random().toString();
      const tempMessage: Message = {
        id: tempId,
        conversationId: activeId,
        senderId: currentUserId || "me",
        content: messageText,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: { id: currentUserId || "me", name: "Me" }
      };
      setMessages(prev => [...prev, tempMessage]);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          content: messageText
        })
      });

      if (!res.ok) throw new Error("Failed to deliver message");
      
      const realMessage = await res.json();
      
      // Swap optimistic ID for real ID
      setMessages(prev => prev.map(m => m.id === tempId ? realMessage : m));
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please retry.");
    } finally {
      setSending(false);
    }
  };

  const handleCreateBotChannel = async () => {
    try {
      setLoadingChannels(true);
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "VEX Support & AI Coach",
          memberIds: []
        })
      });

      if (!res.ok) throw new Error("Failed to spawn bot channel");
      
      await fetchChannels();
    } catch (err) {
      console.error(err);
      alert("Error initializing AI support chat.");
    } finally {
      setLoadingChannels(false);
    }
  };

  const getRecipientName = (conv: Conversation) => {
    if (conv.title) return conv.title;
    const recipient = conv.members.find(m => m.userId !== currentUserId)?.user;
    return recipient?.name || "System Colleague";
  };

  const getRecipientInitials = (conv: Conversation) => {
    const name = getRecipientName(conv);
    return name.slice(0, 1).toUpperCase();
  };

  const getAvatarStyle = (conv: Conversation) => {
    const colors = [
      "bg-[#635BFF]",
      "bg-black dark:bg-white text-white dark:text-black",
      "bg-[#D97757]",
      "bg-primary"
    ];
    const hash = conv.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const activeChat = conversations.find(c => c.id === activeId);

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-[900] text-secondary dark:text-white tracking-tight">Messages</h1>
          </div>
          <p className="text-secondary/70 dark:text-white/60 font-medium text-lg">Communicate directly with recruiters and your AI agent in real-time.</p>
        </div>
      </div>

      {loadingChannels ? (
        <div className="flex-1 flex flex-col items-center justify-center text-secondary/40">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-bold">Synchronizing active communications...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-rose-500 font-bold text-center">
          <p>Failed to load channels: {error}</p>
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex">
          
          {/* Inbox Sidebar */}
          <div className="w-[380px] border-r border-black/5 dark:border-white/5 flex flex-col bg-gray-50/50 dark:bg-black/20 shrink-0">
            <div className="p-6 border-b border-black/5 dark:border-white/5">
              <button 
                onClick={handleCreateBotChannel}
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Start AI Assistant Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {conversations.map((chat) => (
                <button 
                  key={chat.id}
                  onClick={() => setActiveId(chat.id)}
                  className={`w-full p-6 border-b border-black/5 dark:border-white/5 flex items-start gap-4 transition-colors text-left ${activeId === chat.id ? 'bg-primary/5' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-sm ${getAvatarStyle(chat)}`}>
                      {getRecipientInitials(chat)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-secondary dark:text-white truncate">{getRecipientName(chat)}</h3>
                    </div>
                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-black text-secondary dark:text-white' : 'font-medium text-secondary/60 dark:text-white/60'}`}>
                      {chat.last_message?.content || "No messages yet"}
                    </p>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-2">
                      {chat.unreadCount}
                    </div>
                  )}
                </button>
              ))}

              {conversations.length === 0 && (
                <div className="text-center p-8 text-secondary/30 mt-12">
                  <MessageSquare className="w-10 h-10 opacity-30 mx-auto mb-2" />
                  <p className="text-sm font-bold">No active conversations found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          {activeChat ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="h-20 border-b border-black/5 dark:border-white/5 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-sm ${getAvatarStyle(activeChat)}`}>
                    {getRecipientInitials(activeChat)}
                  </div>
                  <div>
                    <h2 className="font-bold text-secondary dark:text-white flex items-center gap-2">
                      {getRecipientName(activeChat)}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#F9F9F9] dark:bg-[#111]">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-secondary/40">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                    <span>Loading conversation thread...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-center text-xs font-bold text-secondary/40 dark:text-white/40 my-4 uppercase tracking-widest">
                      Live Chat Active
                    </div>

                    {messages.map((message) => {
                      const isMe = message.senderId === currentUserId;

                      return (
                        <div 
                          key={message.id}
                          className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                          {!isMe && (
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0 mt-1 ${getAvatarStyle(activeChat)}`}>
                              {getRecipientInitials(activeChat)}
                            </div>
                          )}
                          <div>
                            <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md' : 'bg-white dark:bg-[#222] border border-black/5 dark:border-white/5 rounded-tl-sm'}`}>
                              {message.content}
                            </div>
                            <span className="text-[9px] font-bold text-secondary/40 dark:text-white/40 mt-1 ml-1 block">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messageEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white dark:bg-[#1A1A1A] border-t border-black/5 dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium py-3"
                  />
                  <button 
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="p-2.5 bg-primary text-white rounded-xl hover:scale-105 transition-all shadow-md disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-secondary/40 dark:text-white/40">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-black mb-2">No conversation selected</h3>
              <p className="text-sm font-medium">Select a chat from the left or create an AI support coach chat to begin messaging.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
