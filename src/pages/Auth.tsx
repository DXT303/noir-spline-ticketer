import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SplineViewer from "@/components/SplineViewer";


const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [signupToken, setSignupToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Validate signup token
    if (signupToken === "9l7UV") {
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
    }
  }, [signupToken]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Signed in successfully",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to sign in";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { role },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully! Please sign in.",
      });
   } catch (error: unknown) {
      toast({
        title: "Error",
       description: error instanceof Error ? error.message : "Failed to sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-6xl">
        <Card className="p-8 bg-card border-border">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left side - Auth Forms */}
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome
                </h1>
                <p className="text-muted-foreground">Sign in to access your tickets</p>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background border-border"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-40"
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-token">Sign Up Token</Label>
                      <Input
                        id="signup-token"
                        type="text"
                        placeholder="Enter sign up token"
                        value={signupToken}
                        onChange={(e) => setSignupToken(e.target.value)}
                        required
                        className="bg-background border-border"
                      />
                      {signupToken && !isTokenValid && (
                        <p className="text-xs text-destructive">Invalid token</p>
                      )}
                      {isTokenValid && (
                        <p className="text-xs text-green-600">Token verified ✓</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={!isTokenValid}
                        className="bg-background border-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={!isTokenValid}
                        className="bg-background border-border"
                      />
                      <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Role</Label>
                      <Select onValueChange={setRole} defaultValue={role} disabled={!isTokenValid}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={loading || !isTokenValid}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {loading ? "Creating account..." : "Sign Up"}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-40"
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

 {/* Right side - Spline Robot */}
<div className="hidden lg:block h-full min-h-[500px]">
  <div className="relative h-full">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
    <div className="relative h-full rounded-3xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="w-full h-full [&_#spline-watermark]:hidden [&_a[href*='spline']]:hidden">
        <SplineViewer url="https://prod.spline.design/wnAQj5Qta0hVhjL9/scene.splinecode" className="w-full h-full min-h-[500px]" />
      </div>
    </div>
  </div>
</div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;