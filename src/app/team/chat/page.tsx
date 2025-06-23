'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ChatBox from '@/components/team/ChatBox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Plus, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  teamId: string;
  sender: string;
  senderName?: string;
  message: string;
  createdAt: string;
};

type TeamProfile = {
  id: string;
  teamId: string;
  name?: string;
  email?: string;
  role?: string;
  techStack?: string;
  skills?: string;
  githubRepo?: string;
  discordLink?: string;
};

type TeamMember = {
  id: string;
  name: string;
  role?: string;
  online?: boolean;
  avatarUrl?: string;
};

// Sample teams for demo purposes
const DEMO_TEAMS = [
  { id: 'team-1', name: 'Hackflow Team' },
  { id: 'team-2', name: 'Project Nebula' },
  { id: 'team-3', name: 'Code Wizards' },
];

// Sample team members for demo purposes
const DEMO_MEMBERS: Record<string, TeamMember[]> = {
  'team-1': [
    { id: 'user-1', name: 'Alice', role: 'Frontend Dev', online: true },
    { id: 'user-2', name: 'Bob', role: 'Backend Dev', online: false },
    { id: 'user-3', name: 'Charlie', role: 'UI Designer', online: true },
  ],
  'team-2': [
    { id: 'user-4', name: 'David', role: 'Project Manager', online: true },
    { id: 'user-5', name: 'Emma', role: 'Data Scientist', online: false },
  ],
  'team-3': [
    { id: 'user-6', name: 'Frank', role: 'DevOps', online: true },
    { id: 'user-7', name: 'Grace', role: 'QA Engineer', online: true },
  ],
};

export default function TeamChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamId, setTeamId] = useState('team-1');
  const [teams, setTeams] = useState(DEMO_TEAMS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [senderName, setSenderName] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const { user, isLoaded } = useUser();

  // Set up Socket.io connection
  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      path: '/api/socketio',
    });

    // Set up Socket.io event listeners
    socketInstance.on('connect', () => {
      console.log('Socket.io connected');
      setIsConnected(true);
      
      // Join the team room
      socketInstance.emit('join-team', teamId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err);
      toast.error('Chat connection failed. Trying to reconnect...');
    });

    // Listen for new messages
    socketInstance.on('new-message', (message: Message) => {
      setMessages(prevMessages => {
        // Check if message already exists (avoid duplicates)
        if (prevMessages.some(msg => msg.id === message.id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    });

    // Listen for member presence updates (could be expanded)
    socketInstance.on('member-status', ({ memberId, status }) => {
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, online: status === 'online' } 
          : member
      ));
    });

    // Store socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socketInstance.off('new-message');
      socketInstance.off('member-status');
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      
      // Leave the team room
      socketInstance.emit('leave-team', teamId);
      socketInstance.disconnect();
    };
  }, [teamId]);

  // Set user name when Clerk user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      setSenderName(user.fullName || user.firstName || user.username || 'Anonymous User');
    }
  }, [isLoaded, user]);

  // Fetch messages, team profile and member information
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        // Fetch messages
        const messagesResponse = await fetch(`/api/messages?teamId=${teamId}`);
        if (!messagesResponse.ok) {
          const errorData = await messagesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch messages');
        }
        
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);

        // Fetch team profile
        const profileResponse = await fetch(`/api/teamProfile?teamId=${teamId}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTeamProfile(profileData.profile);
        }

        // In a real app, fetch members from API
        // For now, use demo data
        setTeamMembers(DEMO_MEMBERS[teamId] || []);
        
        setError(null);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to load messages. You may need to initialize the database first.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !socket || !isConnected) return;

    try {
      const userId = user?.id || 'anonymous';
      
      const newMessage = {
        id: `msg_${Date.now()}`,
        teamId,
        sender: userId,
        senderName,
        message: messageText,
        createdAt: new Date().toISOString(),
      };

      // Emit the message via Socket.io
      socket.emit('send-message', newMessage);
      
      // Optimistically add message to UI
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTeamChange = (newTeamId: string) => {
    if (teamId === newTeamId) return;
    
    // Leave the current team room and join the new one
    if (socket && isConnected) {
      socket.emit('leave-team', teamId);
      socket.emit('join-team', newTeamId);
    }
    
    setTeamId(newTeamId);
    setActiveTab("chat"); // Reset to chat view when changing teams
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenderName(e.target.value);
  };

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true);
      const response = await fetch('/api/initialize');
      
      if (!response.ok) {
        throw new Error('Failed to initialize database');
      }
      
      toast.success('Database initialized successfully! Refreshing data...');
      
      // Refresh data after initialization
      const refreshResponse = await fetch(`/api/messages?teamId=${teamId}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setMessages(data.messages || []);
        
        // Also refresh team profile
        const profileResponse = await fetch(`/api/teamProfile?teamId=${teamId}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTeamProfile(profileData.profile);
        }
        
        setError(null);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Chat</h1>
          <p className="text-muted-foreground">
            Collaborate in real-time with your team members
          </p>
        </div>
        
        <div className="flex space-x-3 self-end">
          <Button 
            variant="outline" 
            onClick={initializeDatabase} 
            disabled={isInitializing}
            size="sm"
          >
            {isInitializing ? 'Initializing...' : 'Setup Database'}
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/team/profile">Manage Team</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 p-4 rounded-lg text-destructive">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">Try clicking the "Setup Database" button to initialize the required database tables.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with teams and members */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {/* Team Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={teamId} onValueChange={handleTeamChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Teams</SelectLabel>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3 pb-2">
                    <Avatar>
                      {user?.imageUrl ? (
                        <AvatarImage src={user.imageUrl} alt={senderName} />
                      ) : (
                        <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{senderName}</p>
                      {isConnected && (
                        <div className="flex items-center mt-1">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
                          <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                      value={senderName}
                      onChange={handleNameChange}
                      placeholder="Enter your name"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Team Members</span>
                  <Badge variant="outline" className="ml-2">{teamMembers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[180px]">
                  <div className="p-3 space-y-3">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            {member.avatarUrl ? (
                              <AvatarImage src={member.avatarUrl} alt={member.name} />
                            ) : (
                              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            {member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
                          </div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" style={{ 
                          backgroundColor: member.online ? 'var(--green-500)' : 'var(--neutral-300)' 
                        }}></div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Invite Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(104vh-12rem)]">
            <CardHeader className="pb-0 pt-4">
              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <TabsList>
                    <TabsTrigger value="chat" className="flex gap-1.5">
                      <MessageSquare className="h-4 w-4" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex gap-1.5">
                      <Users className="h-4 w-4" /> Team Info
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center">
                    {teamProfile?.name && (
                      <Badge variant="outline" className="mr-2">
                        {teamProfile.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <TabsContent value="chat" className="h-[calc(100vh-16rem)] m-0">
                  <ChatBox
                    messages={messages}
                    currentUserId={user?.id || ''}
                    loading={loading}
                    onSendMessage={sendMessage}
                  />
                </TabsContent>
                
                <TabsContent value="team" className="h-[calc(100vh-16rem)] m-0">
                  <div className="p-6">
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : teamProfile ? (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">{teamProfile.name || 'Unnamed Team'}</h2>
                          {teamProfile.role && <p className="text-muted-foreground">{teamProfile.role}</p>}
                        </div>
                        
                        {teamProfile.email && (
                          <div>
                            <h3 className="text-sm font-medium mb-1">Contact Email</h3>
                            <p>{teamProfile.email}</p>
                          </div>
                        )}
                        
                        {teamProfile.techStack && (
                          <div>
                            <h3 className="text-sm font-medium mb-1">Tech Stack</h3>
                            <p>{teamProfile.techStack}</p>
                          </div>
                        )}
                        
                        {teamProfile.skills && (
                          <div>
                            <h3 className="text-sm font-medium mb-1">Team Skills</h3>
                            <p className="whitespace-pre-wrap">{teamProfile.skills}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          {teamProfile.githubRepo && (
                            <Button asChild variant="outline" size="sm">
                              <a href={teamProfile.githubRepo} target="_blank" rel="noopener noreferrer">
                                GitHub Repository
                              </a>
                            </Button>
                          )}
                          
                          {teamProfile.discordLink && (
                            <Button asChild variant="outline" size="sm">
                              <a href={teamProfile.discordLink} target="_blank" rel="noopener noreferrer">
                                Discord Server
                              </a>
                            </Button>
                          )}
                          
                          <Button asChild variant="default" size="sm">
                            <Link href="/team/profile">Edit Team Profile</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium mb-3">No Team Profile Found</h3>
                        <p className="text-muted-foreground mb-6">Create a profile for your team to display information here.</p>
                        <Button asChild>
                          <Link href="/team/profile">Create Team Profile</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
} 