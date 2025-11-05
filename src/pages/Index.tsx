import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Users, ArrowRight } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user role and redirect
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleData) {
          navigate(roleData.role === "farmer" ? "/farmer" : "/buyer");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroFarm}
            alt="Agricultural landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-card">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              AgriPrice Connect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-card/90 animate-fade-in">
              Empowering farmers and buyers with real-time mandi prices, smart analytics,
              and direct trade connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="text-lg px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose AgriPrice Connect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Prices</h3>
              <p className="text-muted-foreground">
                Access live mandi prices across India. Compare rates and find the best deals
                for your crops instantly.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-organic/10 rounded-lg flex items-center justify-center mb-4">
                <Sprout className="h-6 w-6 text-organic" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Analytics</h3>
              <p className="text-muted-foreground">
                AI-powered price forecasts and harvest planning tools to maximize your profits
                and reduce risks.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct Trade</h3>
              <p className="text-muted-foreground">
                Connect farmers directly with bulk buyers, eliminating middlemen and increasing
                profit margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl mb-8 text-card/90 max-w-2xl mx-auto">
            Join thousands of farmers and buyers using AgriPrice Connect to make smarter,
            data-driven decisions.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Join Now - It's Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
