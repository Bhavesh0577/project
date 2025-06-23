'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SendIcon, SmileIcon, PaperclipIcon, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  teamId: string;
  sender: string;
  senderName?: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

interface ChatBoxProps {
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatBox({ 
  messages, 
  currentUserId, 
  loading, 
  onSendMessage 
}: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [errorState, setErrorState] = useState<boolean>(false);
  const [recentMessages, setRecentMessages] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
  
  // Track new messages for animations
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // Mark this message as recent (for animation)
      setRecentMessages(prev => ({
        ...prev,
        [latestMessage.id]: true
      }));
      
      // Remove the "recent" flag after the animation
      const timerId = setTimeout(() => {
        setRecentMessages(prev => {
          const newState = { ...prev };
          delete newState[latestMessage.id];
          return newState;
        });
      }, 2000); // Animation duration
      
      return () => clearTimeout(timerId);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simulate typing indicator when others are typing
  useEffect(() => {
    // Randomly simulate someone typing every few messages
    if (messages.length > 0 && messages.length % 3 === 0 && Math.random() > 0.6) {
      setIsTyping(true);
      
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      
      setTypingTimeout(timeout);
      
      return () => clearTimeout(timeout);
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        setErrorState(false);
        onSendMessage(newMessage);
        setNewMessage('');
      } catch (error) {
        setErrorState(true);
        console.error('Error sending message:', error);
      }
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Format timestamp to readable time
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Format date for grouping messages by day
  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach(msg => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    
    return groups;
  }, [messages]);

  // Generate date headers
  const dateLabels = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatToday = formatDate(today.toISOString());
    const formatYesterday = formatDate(yesterday.toISOString());
    
    return {
      [formatToday]: 'Today',
      [formatYesterday]: 'Yesterday'
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-6 py-4 px-3">
            {loading ? (
              <div className="space-y-6 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-12 w-[80%] ml-10" />
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date} className="space-y-4">
                    <div className="text-center">
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        {dateLabels[date] || date}
                      </span>
                    </div>
                    {dateMessages.map((msg, index) => {
                      const isCurrentUser = msg.sender === currentUserId;
                      const showSender = index === 0 || dateMessages[index - 1].sender !== msg.sender;
                      const senderDisplayName = msg.senderName || msg.sender;
                      const initials = getInitials(senderDisplayName);
                      const isRecent = recentMessages[msg.id];
                      const isLastMessage = index === dateMessages.length - 1 && 
                                           Object.values(groupedMessages)[Object.values(groupedMessages).length - 1] === dateMessages;

                      return (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "flex flex-col",
                            isCurrentUser ? "items-end" : "items-start",
                            isRecent && "animate-slide-in-right"
                          )}
                        >
                          {showSender && (
                            <div className={cn(
                              "flex items-center gap-2 mb-1",
                              isCurrentUser && "flex-row-reverse"
                            )}>
                              <Avatar className="h-6 w-6 text-xs">
                                <AvatarFallback className={isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-muted-foreground">
                                {senderDisplayName}
                              </span>
                            </div>
                          )}
                          
                          <div className={cn(
                            "flex items-end gap-2",
                            isCurrentUser && "flex-row-reverse"
                          )}>
                            <div 
                              className={cn(
                                "px-4 py-2 rounded-lg max-w-[80%]",
                                isCurrentUser 
                                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                                  : "bg-muted rounded-tl-none",
                                isRecent && "animate-pulse-once"
                              )}
                            >
                              {msg.message}
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(msg.createdAt)}
                              </span>
                              {isCurrentUser && isLastMessage && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs text-primary">
                                      <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor" className="h-3 w-3">
                                        <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                                      </svg>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Read</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2 ml-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-muted text-xs">
                        {getInitials("Team Member")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted px-3 py-2 rounded-lg rounded-tl-none flex items-center">
                      <span className="typing-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                <div className="bg-muted/50 p-4 rounded-full">
                  <MessageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send a message to start the conversation!
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-3 mt-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground h-8 w-8"
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground h-8 w-8"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <div className="flex-grow relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="pr-10"
                  autoComplete="off"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                >
                  <SmileIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim()} 
                className="h-9 w-9"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
        
        <style jsx>{`
          .typing-indicator {
            display: flex;
            align-items: center;
          }
          
          .typing-indicator .dot {
            height: 6px;
            width: 6px;
            opacity: 0.6;
            border-radius: 50%;
            background-color: currentColor;
            margin: 0 1px;
            animation: bounce 1.4s infinite ease-in-out;
          }
          
          .typing-indicator .dot:nth-child(1) {
            animation-delay: -0.32s;
          }
          
          .typing-indicator .dot:nth-child(2) {
            animation-delay: -0.16s;
          }
          
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0.6);
            }
            40% { 
              transform: scale(1);
            }
          }
          
          @keyframes pulse-once {
            0% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.8;
            }
          }
          
          @keyframes slide-in-right {
            from {
              transform: translateX(20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
} 