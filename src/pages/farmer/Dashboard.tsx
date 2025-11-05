import Analytics from "@/components/farmer/Analytics";
import FarmerProfile from "@/components/farmer/FarmerProfile";
import MandiPrices from "@/components/farmer/MandiPrices";
import RiskAdvisory from "@/components/farmer/RiskAdvisory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, BarChart3, LogOut, MapPin, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<object | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfile(profileData);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary/20 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">AgriPrice Connect</h1>
            <p className="text-sm text-muted-foreground">Farmer Portal</p>
          </div>
            <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{profile?.full_name || "Farmer"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <FarmerProfile />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Tracked varieties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Best Price Today</CardTitle>
              <BarChart3 className="h-4 w-4 text-organic" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹3,200</div>
              <p className="text-xs text-muted-foreground">Tomato - Vashi APMC</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nearby Mandis</CardTitle>
              <MapPin className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Within 50km</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Weather advisory</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="prices">Mandi Prices</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="risk">Risk Advisory</TabsTrigger>
            <TabsTrigger value="logistics">Logistics</TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="space-y-4">
            <MandiPrices />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <RiskAdvisory />
          </TabsContent>

          <TabsContent value="logistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logistics & Transport</CardTitle>
                <CardDescription>Book trucks for your harvest</CardDescription>
              </CardHeader>
              <CardContent>
                <Logistics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Logistics = () => {
  const companies = useMemo(
    () => [
      {
        id: "trans-1",
        name: "GreenLine Transport",
        distanceKm: 5,
        pricePerCrate: 120, // ₹ per crate
        pricePer25kg: 30, // ₹ per 25kg
        contact: "Rahul Sharma",
        phone: "+91-98888-11111",
      },
      {
        id: "trans-2",
        name: "AgriMove Logistics",
        distanceKm: 12,
        pricePerCrate: 100,
        pricePer25kg: 25,
        contact: "Suman Verma",
        phone: "+91-97777-22222",
      },
      {
        id: "trans-3",
        name: "FarmHaul Services",
        distanceKm: 20,
        pricePerCrate: 90,
        pricePer25kg: 22,
        contact: "Amit Patel",
        phone: "+91-96666-33333",
      },
    ],
    []
  );

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [booked, setBooked] = useState<Record<string, boolean>>({});

  const nearestId = useMemo(() => {
    return companies.reduce((best, c) => (c.distanceKm < (best?.distanceKm ?? Infinity) ? c : best), companies[0]).id;
  }, [companies]);

  const handleBook = (companyId: string) => {
    if (!pickupDate || !pickupTime) {
      toast.error("Please select pickup date and time before booking.");
      return;
    }

    // simulate booking
    setBooked((s) => ({ ...s, [companyId]: true }));
    toast.success("Booking confirmed. Driver will contact you shortly.");
    console.log("Booking details:", { companyId, pickupDate, pickupTime });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Pickup Date</Label>
          <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
        </div>
        <div>
          <Label>Pickup Time</Label>
          <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {companies
          .slice()
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{c.name}</p>
                    {c.id === nearestId && <Badge className="text-xs">Nearest</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.distanceKm} km away</p>
                  <p className="text-sm mt-2">Contact: <a href={`tel:${c.phone}`} className="font-medium">{c.contact} ({c.phone})</a></p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-sm">{c.pricePerCrate} ₹ / crate</div>
                <div className="text-sm">{c.pricePer25kg} ₹ / 25kg</div>
                <Button onClick={() => handleBook(c.id)} disabled={!!booked[c.id]}>
                  {booked[c.id] ? "Booked" : "Book"}
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;

// RiskAdvisory component placed at bottom to keep file tidy and avoid creating new files
type Risk = {
  id: string;
  title: string;
  desc: string;
  severity: "high" | "medium" | "low";
};

const RiskAdvisory = () => {
  const risks = useMemo<Risk[]>(
    () => [
      {
        id: "heavy-rain",
        title: "Heavy Rainfall Alert",
        desc: "Expected heavy rainfall in your region for next 2 days. Ensure proper drainage for your crops.",
        severity: "high",
      },
      {
        id: "frost-warning",
        title: "Frost Warning",
        desc: "Night temperatures may drop below freezing for the next 48 hours. Protect sensitive crops and cover seedlings.",
        severity: "high",
      },
      {
        id: "pest-outbreak",
        title: "Pest Outbreak Risk",
        desc: "Conditions are favourable for aphid and mite activity. Inspect lower leaves and consider targeted treatment.",
        severity: "medium",
      },
      {
        id: "disease-pressure",
        title: "Fungal Disease Pressure",
        desc: "Humidity is high which can increase fungal diseases (blight/rotting). Avoid overhead irrigation and remove infected plants.",
        severity: "medium",
      },
      {
        id: "market-volatility",
        title: "Market Price Volatility",
        desc: "Mandi prices may fluctuate sharply this week due to supply shifts. Consider staggered sales to reduce risk.",
        severity: "low",
      },
      {
        id: "transport-strike",
        title: "Transport Disruption",
        desc: "Local transport strikes could delay shipments. Plan buffer days for harvest transport and storage.",
        severity: "low",
      },
    ],
    []
  );

  const showCount = 3; // how many risks to show in the list

  const [currentList, setCurrentList] = useState<Risk[]>(() => risks.slice(0, Math.min(showCount, risks.length)));

  const pickRandomList = useCallback(() => {
    // shuffle copy and take first `showCount`
    const copy = risks.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setCurrentList(copy.slice(0, Math.min(showCount, copy.length)));
  }, [risks]);

  // initialize random on mount
  useEffect(() => {
    pickRandomList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const severityClasses = {
    high: { icon: "text-destructive", title: "text-destructive", bg: "bg-destructive/10" },
    medium: { icon: "text-amber-600", title: "text-amber-700", bg: "bg-amber-50" },
    low: { icon: "text-primary", title: "text-primary", bg: "bg-primary/5" },
  } as const;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={pickRandomList}
        onKeyDown={(e) => e.key === "Enter" && pickRandomList()}
        className={`p-0 cursor-pointer`}
      >
        <div className="space-y-3">
          {currentList.map((r) => {
            const cls = severityClasses[r.severity] || severityClasses.low;
            return (
              <div key={r.id} className={`flex items-start gap-3 p-4 border rounded-lg ${cls.bg}`}>
                <AlertCircle className={`h-5 w-5 ${cls.icon} mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-between">
                    <p className={`font-medium ${cls.title}`}>{r.title}</p>
                    <Badge variant="outline" className="text-xs">Click to refresh</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
