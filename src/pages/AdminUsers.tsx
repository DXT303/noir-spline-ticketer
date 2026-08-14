import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const ADMIN_EMAIL = "admin@gmail.com";

interface UserProfile {
  id: string;
  role: string;
  created_at: string;
  email?: string;
  full_name?: string;
  department?: string;
  designated_area?: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        navigate("/");
        return;
      }
      fetchUsers();
    });
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tickets
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
          </div>
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
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-1">Registered Users</h2>
          <p className="text-muted-foreground">{users.length} total users</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id} className="p-5 bg-card border-border hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{user.full_name || "—"}</p>
                    <p className="text-sm text-muted-foreground">{user.email || user.id}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      user.role === "admin"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {user.department && <p>Department: <span className="text-foreground">{user.department}</span></p>}
                  {user.designated_area && <p>Area: <span className="text-foreground">{user.designated_area}</span></p>}
                  <p>Joined: {format(new Date(user.created_at), "MMM dd, yyyy")}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
