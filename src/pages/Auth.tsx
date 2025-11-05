import heroFarm from "@/assets/hero-farm.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Sprout } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"farmer" | "buyer">("farmer");

  // const handleSignUp = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     const { data, error } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         emailRedirectTo: `${window.location.origin}/`,
  //         data: {
  //           full_name: fullName,
  //         },
  //       },
  //     });

  //     if (error) throw error;

  //     if (data.user) {
  //       // Create profile
  //       const { error: profileError } = await supabase.from("profiles").insert({
  //         user_id: data.user.id,
  //         full_name: fullName,
  //       });

  //       if (profileError) throw profileError;

  //       // Assign role
  //       const { error: roleError } = await supabase.from("user_roles").insert({
  //         user_id: data.user.id,
  //         role: selectedRole,
  //       });

  //       if (roleError) throw roleError;

  //       toast.success("Account created successfully!");
  //       navigate(selectedRole === "farmer" ? "/farmer" : "/buyer");
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message || "Failed to sign up");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // In src/pages/Auth.tsx

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        // Make sure 'full_name' is passed in the 'data' option
        // The trigger will read this value
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // The trigger handles profile and role creation now.
    // We just need to handle the user_roles insert.

    if (data.user) {
      // Assign role (This part is still needed)
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: selectedRole,
      });

      if (roleError) throw roleError;

      // Because email confirmation is on, we don't navigate.
      // We just tell them to check their email.
      toast.success("Account created! Please check your email to confirm.");

      // If you disable email confirmation (Solution 2),
      // you can uncomment the navigate line:
      // navigate(selectedRole === "farmer" ? "/farmer" : "/buyer");
    }
  } catch (error: unknown) {
    // Safer error handling without `any` so lint/type checks pass
    let message = "Failed to sign up";
    if (error instanceof Error && error.message) message = error.message;
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user role
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.session.user.id)
          .single();

        if (roleData) {
          navigate(roleData.role === "farmer" ? "/farmer" : "/buyer");
        }
      }
    } catch (error: unknown) {
      let message = "Failed to sign in";
      if (error instanceof Error && error.message) message = error.message;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroFarm}
          alt="Agricultural landscape"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center justify-center p-12">
          <div className="text-card max-w-md">
            <h1 className="text-4xl font-bold mb-4">AgriPrice Connect</h1>
            <p className="text-lg text-card/90">
              Empowering farmers and buyers with real-time mandi prices, smart analytics, and direct trade connections.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome</CardTitle>
            <CardDescription>Join AgriPrice Connect today</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
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
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Your Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedRole === "farmer" ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col items-center gap-2"
                        onClick={() => setSelectedRole("farmer")}
                      >
                        <Sprout className="h-6 w-6" />
                        <span>Farmer</span>
                      </Button>
                      <Button
                        type="button"
                        variant={selectedRole === "buyer" ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col items-center gap-2"
                        onClick={() => setSelectedRole("buyer")}
                      >
                        <ShoppingCart className="h-6 w-6" />
                        <span>Bulk Buyer</span>
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
