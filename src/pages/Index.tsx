import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SplineViewer from "@/components/SplineViewer";
import CreateTicketDialog from "@/components/CreateTicketDialog";
import TicketCard from "@/components/TicketCard";
import TicketFilters from "@/components/TicketFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Send, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your KAI assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTickets();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTickets();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'open' | 'in_progress' | 'closed') => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setTickets(tickets.map(ticket => 
        ticket.id === id ? { ...ticket, status: newStatus } : ticket
      ));

      toast({
        title: "Success",
        description: "Ticket status updated",
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handleCancelTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTickets(tickets.filter(ticket => ticket.id !== id));

      toast({
        title: "Success",
        description: "Ticket cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      toast({
        title: "Error",
        description: "Failed to cancel ticket",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTickets([]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help! I can assist you with creating tickets, checking ticket status, and answering common questions about our support system.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const filteredTickets = activeFilter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === activeFilter);

  const ticketCounts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
              <Link to="/about">
  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
    Build by: IT Department
  </span>
</Link>
</div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  KFL Manpower Agency
                </span>
                <br />
                <span className="text-foreground">Ticketing System</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the future of customer support with our KAI-assisted ticketing system. 
                Fast, efficient, and always available.
              </p>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                   onClick={() => router.push('/auth')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all"
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-muted"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Content - Spline Robot */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative h-[400px] rounded-3xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
                <SplineViewer url="https://prod.spline.design/dcFSOfiim5AnfnNt/scene.splinecode" className="w-full h-[500px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 container mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Real-time Updates', description: 'Get instant notifications on ticket status changes' },
              { title: 'Common Problems', description: 'Detailed Breakdown with Sub-Categories' },
              { title: 'KAI Assistant', description: 'Let our robot help you resolve issues faster' },
            ].map((feature, i) => (
              <Link 
                to={feature.title === 'Common Problems' ? '/Category' : '#'} 
                key={i} 
                className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group cursor-pointer"
                onClick={() => feature.title === 'KAI Assistant' && setIsChatOpen(true)}
              >
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Chat Modal */}
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="max-w-5xl h-[600px] p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Left side - Chat Interface */}
              <div className="flex flex-col h-full border-r border-border">
                <DialogHeader className="p-6 border-b border-border">
                  <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    KAI Assistant
                  </DialogTitle>
                  <p className="text-muted-foreground text-sm">Chat with our AI to get instant help</p>
                </DialogHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                            <img 
                              src="/avatar.jpg" 
                              alt="Kai AI Assistant"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {message.sender === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                            <img 
                              src="/avatar.jpg" 
                              alt="User"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-6 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-background border-border"
                    />
                    <Button type="submit" size="icon" className="bg-primary text-primary-foreground">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right side - Spline Robot */}
              <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
                <div className="relative w-full h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                  <div className="relative h-full rounded-3xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
                    <SplineViewer key={isChatOpen ? 'chat-spline-active' : 'chat-spline-inactive'} url="https://prod.spline.design/dcFSOfiim5AnfnNt/scene.splinecode" className="w-full h-[500px]" />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">TicketBot</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tickets Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Support Tickets</h2>
                <p className="text-muted-foreground">Manage and track all your support requests</p>
              </div>
              <CreateTicketDialog onTicketCreated={fetchTickets} />
            </div>

            {/* Filters */}
            <div className="mb-8">
              <TicketFilters 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={ticketCounts}
              />
            </div>

            {/* Tickets List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredTickets.length > 0 ? (
              <div className="grid gap-4">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    {...ticket}
                    createdAt={ticket.created_at}
                    onStatusChange={handleStatusChange}
                    onCancel={handleCancelTicket}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-2xl">
                <p className="text-muted-foreground">No tickets found. Create your first ticket to get started!</p>
              </div>
            )}
          </div>
          
          {/* Right side - Spline Robot */}
          <div className="hidden lg:block">
            <div className="relative h-full">
              <div className="sticky top-48">
                <div className="relative h-[450px] rounded-3xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
                  <SplineViewer url="https://prod.spline.design/dcFSOfiim5AnfnNt/scene.splinecode" className="w-full h-[550px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
