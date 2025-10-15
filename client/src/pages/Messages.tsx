import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatDateRelative } from "@/lib/formatters";
import { insertMessageSchema } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  User,
  Loader2,
  Clock,
  CheckCheck
} from "lucide-react";
import { z } from "zod";

const sendMessageSchema = insertMessageSchema.omit({ senderId: true });
type SendMessageData = z.infer<typeof sendMessageSchema>;

export default function Messages() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get URL parameters for pre-selecting conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
      setSelectedConversation(userId);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t('errors.unauthorized'),
        description: t('errors.unauthorized'),
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/giris?next=/mesajlar");
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await apiRequest('POST', '/api/messages', data);
      return response.json();
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('errors.unauthorized'),
          description: t('errors.unauthorized'),
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/giris?next=/mesajlar");
        }, 500);
        return;
      }
      toast({
        title: t('errors.server_error'),
        description: t('errors.network_error'),
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('listing');

    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      message: messageText.trim(),
      listingId: listingId || undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="messages-loading">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="messages-page">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">
            {t('messages.title')}
          </h1>
          <p className="text-muted-foreground" data-testid="page-subtitle">
            {t('nav.messages')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('messages.conversations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
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
                ) : conversations?.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-sm font-semibold mb-2">{t('messages.no_messages')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t('messages.start_conversation')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y" data-testid="conversations-list">
                    {conversations?.map((conversation: any) => (
                      <button
                        key={conversation.user.id}
                        onClick={() => setSelectedConversation(conversation.user.id)}
                        className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                          selectedConversation === conversation.user.id ? 'bg-muted border-r-2 border-primary' : ''
                        }`}
                        data-testid={`conversation-${conversation.user.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {conversation.user.firstName?.[0] || 'U'}
                              {conversation.user.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {conversation.user.firstName} {conversation.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateRelative(conversation.lastMessage.createdAt)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage.message}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="mt-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-3">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={conversations?.find((c: any) => c.user.id === selectedConversation)?.user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {conversations?.find((c: any) => c.user.id === selectedConversation)?.user.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold" data-testid="selected-conversation-name">
                        {conversations?.find((c: any) => c.user.id === selectedConversation)?.user.firstName}{' '}
                        {conversations?.find((c: any) => c.user.id === selectedConversation)?.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('common.loading')}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Messages */}
                  <ScrollArea className="h-[400px] p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? 'w-48' : 'w-56'}`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4" data-testid="messages-container">
                        {messages?.map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                              data-testid={`message-${message.id}`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <div className={`flex items-center justify-end mt-1 gap-1 ${
                                message.senderId === user?.id 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">
                                  {formatDateRelative(message.createdAt)}
                                </span>
                                {message.senderId === user?.id && message.isRead && (
                                  <CheckCheck className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder={t('messages.type_message')}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="resize-none"
                        rows={2}
                        data-testid="message-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
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
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('messages.start_conversation')}</h3>
                  <p className="text-muted-foreground">
                    {t('messages.start_conversation')}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
