import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { z } from "zod";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatDateRelative } from "@/lib/formatters";
import { insertMessageSchema } from "@shared/schema";
import {
  MessageSquare,
  Send,
  Loader2,
  Clock,
  CheckCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const sendMessageSchema = insertMessageSchema.omit({ senderId: true });
type SendMessageData = z.infer<typeof sendMessageSchema>;

export default function Messages() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Selected conversation (userId) can be prefilled via ?user=...
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Preselect from URL once
  useEffect(() => {
    const url = new URL(window.location.href);
    const uid = url.searchParams.get("user");
    if (uid) setSelectedConversation(uid);
  }, []);

  // Require auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("errors.unauthorized"),
        description: t("errors.unauthorized"),
        variant: "destructive",
      });
      setTimeout(() => setLocation("/giris?next=/mesajlar"), 400);
    }
  }, [authLoading, isAuthenticated, setLocation, t, toast]);

  // Conversations list (poll slow)
  const {
    data: conversations,
    isLoading: conversationsLoading,
  } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  // Active conversation messages (poll faster)
  const {
    data: messages,
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["/api/messages", selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
    refetchInterval: 5_000,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Optionally mark received messages as read when opening/refreshing a thread.
  // (Best-effort: silently ignore if backend route differs.)
  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      // Try a likely route; ignore failures.
      await Promise.all(
        ids.map(async (id) => {
          try {
            await apiRequest("POST", `/api/messages/${id}/read`);
          } catch {}
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  useEffect(() => {
    if (!messages || !user?.id) return;
    const unreadForMe = messages
      .filter((m: any) => m.receiverId === user.id && !m.isRead)
      .map((m: any) => m.id);
    if (unreadForMe.length) markRead.mutate(unreadForMe);
  }, [messages, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("errors.unauthorized"),
          description: t("errors.unauthorized"),
          variant: "destructive",
        });
        setTimeout(() => setLocation("/giris?next=/mesajlar"), 400);
        return;
      }
      toast({
        title: t("errors.server_error"),
        description: t("errors.network_error"),
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    const url = new URL(window.location.href);
    const listingId = url.searchParams.get("listing") || undefined;

    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      message: messageText.trim(),
      listingId,
    });
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeUser = useMemo(
    () => conversations?.find((c: any) => c.user.id === selectedConversation)?.user,
    [conversations, selectedConversation]
  );

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

  return (
    <div className="min-h-screen bg-background" data-testid="messages-page">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="page-title">
            {t("messages.title")}
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="page-subtitle">
            {t("nav.messages")}
          </p>
        </div>

        {/* Layout: mobile-first stack, desktop split */}
        <div className="grid grid-rows-[auto_auto_1fr_auto] lg:grid-rows-[auto_1fr] lg:grid-cols-4 gap-4 lg:gap-6 min-h-[70vh]">
          {/* Conversations */}
          <Card className="lg:col-span-1 row-span-2">
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-5 w-5" />
                {t("messages.conversations")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[40vh] lg:h-[calc(70vh-4rem)]">
                {conversationsLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !conversations?.length ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">{t("messages.no_messages")}</p>
                    <p className="text-xs text-muted-foreground">{t("messages.start_conversation")}</p>
                  </div>
                ) : (
                  <div className="divide-y" data-testid="conversations-list">
                    {conversations.map((c: any) => {
                      const isActive = selectedConversation === c.user.id;
                      return (
                        <button
                          key={c.user.id}
                          onClick={() => setSelectedConversation(c.user.id)}
                          className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                            isActive ? "bg-muted/70 border-l-2 border-primary" : ""
                          }`}
                          data-testid={`conversation-${c.user.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={c.user.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {c.user.firstName?.[0] || "U"}
                                {c.user.lastName?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">
                                  {c.user.firstName} {c.user.lastName}
                                </p>
                                <span className="text-[11px] text-muted-foreground">
                                  {formatDateRelative(c.lastMessage.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {c.lastMessage.message}
                              </p>
                              {!!c.unreadCount && (
                                <Badge className="mt-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[11px]">
                                  {c.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Active Thread */}
          <Card className="lg:col-span-3 row-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Thread header */}
                <CardHeader className="py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeUser?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {activeUser?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold" data-testid="selected-conversation-name">
                        {activeUser?.firstName} {activeUser?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {messagesLoading ? t("common.loading") : t("messages.connected")}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Thread body */}
                <CardContent className="p-0 flex-1 flex flex-col">
                  <ScrollArea
                    className="flex-1 p-3 sm:p-4"
                    aria-live="polite"
                    aria-busy={messagesLoading}
                  >
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                          >
                            <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? "w-48" : "w-56"}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4" data-testid="messages-container">
                        {messages?.map((m: any) => {
                          const mine = m.senderId === user?.id;
                          return (
                            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[82%] sm:max-w-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg ${
                                  mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                }`}
                                data-testid={`message-${m.id}`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                                <div
                                  className={`mt-1 flex items-center gap-1 justify-end text-[11px] ${
                                    mine ? "text-primary-foreground/70" : "text-muted-foreground"
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDateRelative(m.createdAt)}</span>
                                  {mine && m.isRead && <CheckCheck className="h-3 w-3" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Composer */}
                  <div className="border-t p-3 sm:p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={t("messages.type_message")}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleEnter}
                        className="resize-none"
                        rows={2}
                        data-testid="message-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="self-end"
                        data-testid="send-message-button"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[40vh] sm:h-[50vh]">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-1">
                    {t("messages.start_conversation")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("messages.no_messages")}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}