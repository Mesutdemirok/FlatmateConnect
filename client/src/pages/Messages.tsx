import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import Header from "@/components/Header";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/useResponsive";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDateRelative } from "@/lib/formatters";
import { insertMessageSchema } from "@shared/schema";
import {
  MessageSquare,
  Loader2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const sendMessageSchema = insertMessageSchema.omit({ senderId: true });
type SendMessageData = z.infer<typeof sendMessageSchema>;

export default function Messages() {
  const { t } = useTranslation();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get userId from URL params or query string
  const urlUserId = params.userId;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(urlUserId || null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useResponsive(1024);

  // Update selected user when URL changes
  useEffect(() => {
    if (urlUserId) {
      setSelectedUserId(urlUserId);
    }
  }, [urlUserId]);

  // Preselect from query string (legacy support)
  useEffect(() => {
    if (!urlUserId) {
      const url = new URL(window.location.href);
      const uid = url.searchParams.get("user");
      if (uid) setSelectedUserId(uid);
    }
  }, [urlUserId]);

  // Require auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const nextPath = selectedUserId ? `/mesajlar/${selectedUserId}` : "/mesajlar";
      toast({
        title: t("errors.unauthorized"),
        description: t("errors.please_login"),
        variant: "destructive",
      });
      setTimeout(() => setLocation(`/giris?next=${encodeURIComponent(nextPath)}`), 400);
    }
  }, [authLoading, isAuthenticated, selectedUserId, setLocation, t, toast]);

  // Fetch conversations list
  const {
    data: conversations,
    isLoading: conversationsLoading,
  } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  // Fetch active conversation messages
  const {
    data: messages,
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["/api/messages", selectedUserId],
    enabled: isAuthenticated && !!selectedUserId,
    refetchInterval: 5_000,
  });

  // Fetch recipient user info (for new conversations)
  const {
    data: recipientUser,
    isLoading: recipientLoading,
    error: recipientError,
  } = useQuery({
    queryKey: ["/api/users", selectedUserId],
    enabled: isAuthenticated && !!selectedUserId,
    refetchInterval: false,
  });

  // Show error toast if recipient fetch fails
  useEffect(() => {
    if (recipientError && selectedUserId) {
      toast({
        title: t("errors.user_not_found"),
        description: t("errors.recipient_load_failed"),
        variant: "destructive",
      });
    }
  }, [recipientError, selectedUserId, toast, t]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read
  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map(async (id) => {
          try {
            await apiRequest("PATCH", `/api/messages/${id}/read`);
          } catch {}
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  useEffect(() => {
    if (!Array.isArray(messages) || !user?.id) return;
    const unreadForMe = messages
      .filter((m: any) => m.receiverId === user.id && !m.isRead)
      .map((m: any) => m.id);
    if (unreadForMe.length) markRead.mutate(unreadForMe);
  }, [messages, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("errors.unauthorized"),
          description: t("errors.please_login"),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t("errors.server_error"),
        description: t("errors.network_error"),
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    if (!selectedUserId) return;
    const url = new URL(window.location.href);
    const listingId = url.searchParams.get("listing") || undefined;

    sendMessageMutation.mutate({
      receiverId: selectedUserId,
      message,
      listingId,
    });
  };

  // Determine active user - prioritize directly fetched recipient over conversation list
  const activeUser = recipientUser || (Array.isArray(conversations)
    ? conversations.find((c: any) => c.user.id === selectedUserId)?.user
    : undefined);

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    setLocation(`/mesajlar/${userId}`);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
    setLocation("/mesajlar");
  };

  // Simulate typing indicator (in a real app, this would come from WebSocket or polling)
  const handleUserTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center" data-testid="messages-loading">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Mobile view: Show either conversation list OR chat window
  const showMobileChat = selectedUserId && isMobile;

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="messages-page">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Conversations List (Sidebar) */}
        <div
          className={`${
            showMobileChat ? "hidden" : "flex"
          } lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-border bg-card`}
          data-testid="conversations-sidebar"
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold flex items-center gap-2" data-testid="page-title">
              <MessageSquare className="h-5 w-5" />
              {t("messages.title")}
            </h1>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full max-w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(conversations) || conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium text-foreground">{t("messages.no_messages")}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("messages.start_conversation")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border" data-testid="conversations-list">
                {Array.isArray(conversations) && conversations.map((c: any) => {
                  const isActive = selectedUserId === c.user.id;
                  return (
                    <button
                      key={c.user.id}
                      onClick={() => handleSelectConversation(c.user.id)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        isActive ? "bg-muted" : ""
                      }`}
                      data-testid={`conversation-${c.user.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={c.user.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {c.user.firstName?.[0] || "U"}
                            {c.user.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm truncate text-foreground">
                              {c.user.firstName} {c.user.lastName}
                            </p>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                              {formatDateRelative(c.lastMessage.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate flex-1">
                              {c.lastMessage.message}
                            </p>
                            {!!c.unreadCount && (
                              <Badge className="h-5 min-w-[20px] rounded-full px-1.5 flex items-center justify-center text-[11px] flex-shrink-0">
                                {c.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`${
            !showMobileChat && selectedUserId ? "hidden lg:flex" : showMobileChat ? "flex" : "hidden lg:flex"
          } flex-col flex-1 bg-background`}
          data-testid="chat-window"
        >
          {selectedUserId && !activeUser && recipientLoading ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
              </div>
            </div>
          ) : selectedUserId && activeUser ? (
            <>
              {/* Chat Header */}
              <div className="sticky top-0 z-10 bg-card border-b border-border">
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  {/* Back button (mobile only) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden flex-shrink-0"
                    onClick={handleBackToList}
                    data-testid="back-button"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={activeUser.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {activeUser.firstName?.[0] || "U"}
                      {activeUser.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" data-testid="selected-conversation-name">
                      {activeUser.firstName} {activeUser.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isTyping ? (
                        <span className="flex items-center gap-1">
                          <span className="typing-indicator">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </span>
                          <span>yazıyor...</span>
                        </span>
                      ) : messagesLoading ? (
                        t("common.loading")
                      ) : (
                        t("messages.connected")
                      )}
                    </p>
                  </div>

                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 bg-background"
                data-testid="messages-container"
              >
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                      >
                        <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-56" : "w-64"}`} />
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">Henüz mesaj yok</p>
                      <p className="text-xs mt-1">İlk mesajı gönderin</p>
                    </div>
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {messages.map((m: any, index: number) => {
                      const isMine = m.senderId === user?.id;
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showAvatar = !prevMessage || prevMessage.senderId !== m.senderId;

                      return (
                        <MessageBubble
                          key={m.id}
                          message={m.message}
                          isMine={isMine}
                          senderName={isMine ? undefined : `${activeUser.firstName} ${activeUser.lastName}`}
                          senderImage={isMine ? undefined : activeUser.profileImageUrl}
                          timestamp={m.createdAt}
                          isRead={m.isRead}
                          showAvatar={showAvatar}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <MessageInput
                onSend={handleSendMessage}
                isSending={sendMessageMutation.isPending}
                onTyping={handleUserTyping}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MessageSquare className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {t("messages.start_conversation")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("messages.no_messages")}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
