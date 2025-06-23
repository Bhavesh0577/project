'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Users, MessageSquare, Mic, MicOff, Volume2, VolumeX, Languages, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

type GlobalUser = {
  id: string;
  name: string;
  country: string;
  timezone: string;
  skills: string[];
  languages: string[];
  isOnline: boolean;
  avatar?: string;
  currentProject?: string;
};

type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  language: string;
  translation?: string;
};

const DEMO_USERS: GlobalUser[] = [
  {
    id: '1',
    name: 'Akira Tanaka',
    country: 'Japan',
    timezone: 'JST',
    skills: ['React', 'AI/ML', 'Python'],
    languages: ['Japanese', 'English'],
    isOnline: true,
    currentProject: 'AI Healthcare Assistant'
  },
  {
    id: '2',
    name: 'Maria Santos',
    country: 'Brazil',
    timezone: 'BRT',
    skills: ['Flutter', 'Firebase', 'UI/UX'],
    languages: ['Portuguese', 'Spanish', 'English'],
    isOnline: true,
    currentProject: 'Sustainable Transport App'
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    country: 'Egypt',
    timezone: 'EET',
    skills: ['Node.js', 'Blockchain', 'Solidity'],
    languages: ['Arabic', 'English'],
    isOnline: false,
    currentProject: 'DeFi Education Platform'
  },
  {
    id: '4',
    name: 'Emma Nielsen',
    country: 'Denmark',
    timezone: 'CET',
    skills: ['Vue.js', 'GraphQL', 'DevOps'],
    languages: ['Danish', 'English', 'German'],
    isOnline: true,
    currentProject: 'Climate Data Visualization'
  }
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' }
];

export default function GlobalCollabHub() {
  const [activeUsers, setActiveUsers] = useState<GlobalUser[]>(DEMO_USERS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const { user } = useUser();

  // Simulate real-time translation
  const translateMessage = async (message: string, targetLang: string) => {
    // In a real implementation, this would call a translation API
    if (targetLang === 'en') return message;
    return `[${targetLang.toUpperCase()}] ${message}`;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName || user.firstName || 'Anonymous',
      message: newMessage,
      timestamp: new Date(),
      language: selectedLanguage
    };

    // Add translation for other users
    if (selectedLanguage !== 'en') {
      message.translation = await translateMessage(newMessage, 'en');
    }

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    toast.success('Message sent to global chat');
  };

  const filteredUsers = activeUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkill === 'all' || !selectedSkill || user.skills.some(skill => 
      skill.toLowerCase().includes(selectedSkill.toLowerCase())
    );
    return matchesSearch && matchesSkill;
  });

  const onlineUsers = filteredUsers.filter(user => user.isOnline);
  const offlineUsers = filteredUsers.filter(user => !user.isOnline);

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Egypt': '🇪🇬',
      'Denmark': '🇩🇰',
      'USA': '🇺🇸',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'India': '🇮🇳'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          Global Collaboration Hub
        </h1>
        <p className="text-muted-foreground">
          Connect with hackathon participants worldwide in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Users Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Global Participants
              </CardTitle>
              <CardDescription>
                {onlineUsers.length} online • {activeUsers.length} total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-2">
                <Input
                  placeholder="Search participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="flutter">Flutter</SelectItem>
                    <SelectItem value="node">Node.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Online Users */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online ({onlineUsers.length})
                </h4>
                {onlineUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <span className="text-lg">{getCountryFlag(user.country)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {user.timezone}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.skills.slice(0, 2).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {user.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                      {user.currentProject && (
                        <p className="text-xs text-primary mt-1 truncate">
                          Working on: {user.currentProject}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Offline Users */}
              {offlineUsers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    Offline ({offlineUsers.length})
                  </h4>
                  {offlineUsers.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border opacity-60">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <span className="text-sm">{getCountryFlag(user.country)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{user.timezone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat and Collaboration */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Global Chat</TabsTrigger>
              <TabsTrigger value="voice">Voice Rooms</TabsTrigger>
              <TabsTrigger value="projects">Live Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Global Chat
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                      >
                        {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-64 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/20">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Languages className="h-8 w-8 mx-auto mb-2" />
                        <p>Start a global conversation!</p>
                        <p className="text-sm">Messages are automatically translated</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{message.userName}</p>
                              <Badge variant="outline" className="text-xs">
                                {LANGUAGES.find(l => l.code === message.language)?.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{message.message}</p>
                            {message.translation && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Translation: {message.translation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Type a message in ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Collaboration Rooms</CardTitle>
                  <CardDescription>
                    Join voice rooms for real-time collaboration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['AI/ML Discussion', 'Frontend Developers', 'Blockchain Projects', 'Beginner Friendly'].map((room, i) => (
                      <div key={room} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{room}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {Math.floor(Math.random() * 15) + 1} participants
                        </p>
                        <Button variant="outline" className="w-full">
                          Join Room
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Live Projects</CardTitle>
                  <CardDescription>
                    See what others are building in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DEMO_USERS.filter(u => u.currentProject && u.isOnline).map(user => (
                      <div key={user.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.country}</p>
                          </div>
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        <h4 className="font-medium text-primary">{user.currentProject}</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.skills.map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">View Project</Button>
                          <Button variant="outline" size="sm">Collaborate</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}