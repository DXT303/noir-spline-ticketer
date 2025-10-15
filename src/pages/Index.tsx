import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SplineViewer from "@/components/SplineViewer";
import CreateTicketDialog from "@/components/CreateTicketDialog";
import TicketCard from "@/components/TicketCard";
import TicketFilters from "@/components/TicketFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTickets([]);
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
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  AI-Powered Support
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  Smart Ticketing
                </span>
                <br />
                <span className="text-foreground">Made Simple</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the future of customer support with our AI-assisted ticketing system. 
                Fast, efficient, and always available.
              </p>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/auth'}
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
              <div className="relative h-[500px] rounded-3xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
                <SplineViewer url="https://prod.spline.design/LlkWhD4yDvG5WXqf/scene.splinecode" className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 container mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Real-time Updates', description: 'Get instant notifications on ticket status changes' },
              { title: 'Priority Management', description: 'Organize tickets by urgency and importance' },
              { title: 'AI Assistant', description: 'Let our robot help you resolve issues faster' },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group">
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
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
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg" />
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No tickets found. Create your first ticket to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
