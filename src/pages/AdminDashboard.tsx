import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TicketCard from "@/components/TicketCard";
import TicketFilters from "@/components/TicketFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Users } from "lucide-react";

const ADMIN_EMAIL = "admin@gmail.com";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "unresolved" | "closed";
  priority: "low" | "medium" | "high";
  created_at: string;
  user_email: string | null;
  user_id: string | null;
  user_name: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "unresolved" | "closed">("all");
  const [undoState, setUndoState] = useState<{ id: string; prevStatus: Ticket["status"] } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        navigate("/");
        return;
      }
      fetchTickets();
    });
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Ticket["status"]) => {
    const prevTicket = tickets.find((t) => t.id === id);
    if (!prevTicket) return;
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update ticket", variant: "destructive" });
      return;
    }
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    setActiveFilter(newStatus);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState({ id, prevStatus: prevTicket.status });
    undoTimerRef.current = setTimeout(() => setUndoState(null), 10000);
  };

  const handleUndo = async () => {
    if (!undoState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { id, prevStatus } = undoState;
    setUndoState(null);
    const { error } = await supabase.from("tickets").update({ status: prevStatus }).eq("id", id);
    if (!error) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: prevStatus } : t)));
      setActiveFilter(prevStatus);
    }
  };

  const handleCancelTicket = async (id: string) => {
    const { error } = await supabase.from("tickets").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete ticket", variant: "destructive" });
      return;
    }
    setTickets((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Success", description: "Ticket deleted" });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredTickets =
    activeFilter === "all" ? tickets : tickets.filter((t) => t.status === activeFilter);

  const ticketCounts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    unresolved: tickets.filter((t) => t.status === "unresolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link to="/admin/users">
              <Button variant="outline" size="sm" className="border-border">
                <Users className="w-4 h-4 mr-2" />
                Users
              </Button>
            </Link>
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
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">All Tickets</h2>
            <p className="text-muted-foreground">Manage all support requests</p>
          </div>
        </div>

        {undoState && (
          <div className="mb-4 flex items-center justify-between px-4 py-3 bg-card border border-primary/30 rounded-xl">
            <span className="text-sm text-muted-foreground">Status updated.</span>
            <Button size="sm" variant="outline" onClick={handleUndo} className="border-primary/30 hover:bg-primary/10">
              Undo
            </Button>
          </div>
        )}

        <div className="mb-8">
          <TicketFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={ticketCounts} />
        </div>

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
                userEmail={ticket.user_email}
                userName={ticket.user_name}
                isAdmin
                onStatusChange={handleStatusChange}
                onCancel={handleCancelTicket}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No tickets found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
