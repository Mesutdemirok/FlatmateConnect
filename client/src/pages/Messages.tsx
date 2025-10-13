import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDateRelative } from "@/lib/formatters";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, ArrowLeft } from "lucide-react";

export default function Messages() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
      setSelectedConversation(userId);
    }
  }, []);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/giris?next=/mesajlar");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<any[]>({
    queryKey: ['/api/conversations'],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ['/api/messages', selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
    refetchInterval: 5000,
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/messages', data);
      return response.json();
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive"
      });
    }
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

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

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const selectedConv = conversations?.find((c: any) => 
    c.user?.id === selectedConversation
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop & Mobile Layout */}
        <div className="w-full max-w-7xl mx-auto flex">
          
          {/* Conversations List - Left Sidebar */}
          <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-border flex-col`}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground">Mesajlar</h1>
            </div>
            
            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !conversations || conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">Henüz mesajınız yok</h2>
                  <p className="text-sm text-muted-foreground">Birisiyle sohbet başlatın</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations.map((conv: any) => (
                    <button
                      key={conv.user?.id}
                      onClick={() => setSelectedConversation(conv.user?.id)}
                      data-testid={`conversation-${conv.user?.id}`}
                      className={`w-full p-4 hover:bg-accent transition-colors text-left ${
                        selectedConversation === conv.user?.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={conv.user?.profileImageUrl} />
                          <AvatarFallback>{getInitials(conv.user?.firstName || 'A')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground truncate">
                              {conv.user?.firstName} {conv.user?.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDateRelative(conv.lastMessage?.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.message}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat View - Right Side */}
          <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50 dark:bg-slate-900`}>
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">Mesajlarınız</h2>
                  <p className="text-muted-foreground">Bir sohbet seçin ve mesajlaşmaya başlayın</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white dark:bg-slate-800 border-b border-border flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={selectedConv?.user?.profileImageUrl} />
                    <AvatarFallback>{getInitials(selectedConv?.user?.firstName || 'A')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {selectedConv?.user?.firstName} {selectedConv?.user?.lastName}
                    </h2>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className={i % 2 === 0 ? 'flex justify-end' : 'flex justify-start'}>
                          <Skeleton className="h-16 w-64 rounded-2xl" />
                        </div>
                      ))}
                    </div>
                  ) : !messages || messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Henüz mesaj yok. İlk mesajı gönderin!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg: any) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} data-testid={`message-${msg.id}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn 
                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                : 'bg-white dark:bg-slate-800 text-foreground rounded-bl-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              <span className={`text-xs mt-1 block ${isOwn ? 'text-indigo-100' : 'text-muted-foreground'}`}>
                                {formatDateRelative(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-border">
                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={handleTextareaChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Mesaj yazın..."
                      data-testid="input-message"
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      data-testid="button-send"
                      className="h-11"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <><Send className="h-5 w-5 mr-2" /> Gönder</>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
