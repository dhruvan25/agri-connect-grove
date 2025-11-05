import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator"; 
import { toast } from "sonner"; 
import { LogOut, ShoppingCart, TrendingDown, CheckCircle2, PackageSearch, Users, Leaf, Truck } from "lucide-react"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// --- New Imports ---
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- MOCK DATA FOR FARMER MARKETPLACE ---
const farmerOfferings = [
  {
    id: "fo_1",
    farmerName: "Ramesh Patel",
    location: "Nashik, Maharashtra",
    isOrganic: true,
    crop: {
      name: "Tomato",
      image_url: "/crops/tomato.jpg",
      category: "Vegetable",
    },
    price: 2800,
    unit: "quintal",
  },
  {
    id: "fo_2",
    farmerName: "Sunita Reddy",
    location: "Anantapur, Andhra Pradesh",
    isOrganic: false,
    crop: {
      name: "Chilli",
      image_url: "/crops/chilli.jpg",
      category: "Spice",
    },
    price: 7500,
    unit: "quintal",
  },
  {
    id: "fo_3",
    farmerName: "Gurpreet Singh",
    location: "Ludhiana, Punjab",
    isOrganic: false,
    crop: {
      name: "Wheat",
      image_url: "/crops/wheat.jpg",
      category: "Grain",
    },
    price: 2200,
    unit: "quintal",
  },
    {
    id: "fo_4",
    farmerName: "Meena Kumari",
    location: "Mysore, Karnataka",
    isOrganic: true,
    crop: {
      name: "Sugarcane",
      image_url: "/crops/sugarcane.jpg",
      category: "Cash Crop",
    },
    price: 350,
    unit: "quintal",
  },
    {
    id: "fo_5",
    farmerName: "Arjun Desai",
    location: "Indore, Madhya Pradesh",
    isOrganic: false,
    crop: {
      name: "Potato",
      image_url: "/crops/potato.jpg",
      category: "Vegetable",
    },
    price: 1800,
    unit: "quintal",
  },
    {
    id: "fo_6",
    farmerName: "Priya Varma",
    location: "Kurnool, Andhra Pradesh",
    isOrganic: true,
    crop: {
      name: "Onion",
      image_url: "/crops/onion.jpg",
      category: "Vegetable",
    },
    price: 2100,
    unit: "quintal",
  },
];
// --- END OF FARMER MOCK DATA ---

// --- MOCK DATA FOR MY ORDERS ---
const mockOrders = [
  {
    id: "ord_001",
    cropName: "Tomato",
    farmerName: "Ramesh Patel",
    quantity: "50 quintal",
    amount: "₹1,40,000",
    status: "In Transit",
    date: "2025-11-03",
  },
  {
    id: "ord_002",
    cropName: "Potato",
    farmerName: "Arjun Desai",
    quantity: "100 quintal",
    amount: "₹1,80,000",
    status: "Processing",
    date: "2025-11-04",
  },
  {
    id: "ord_003",
    cropName: "Onion",
    farmerName: "Priya Varma",
    quantity: "20 quintal",
    amount: "₹42,000",
    status: "Processing",
    date: "2025-11-05",
  },
  {
    id: "ord_004",
    cropName: "Wheat",
    farmerName: "Gurpreet Singh",
    quantity: "200 quintal",
    amount: "₹4,40,000",
    status: "Completed",
    date: "2025-10-28",
  },
];
// --- END OF ORDERS MOCK DATA ---


const BuyerDashboard = () => {
  const navigate = useNavigate();
  
  const [deals, setDeals] = useState<any[]>(farmerOfferings);
  const [myOrders, setMyOrders] = useState<any[]>(mockOrders); 

  // Mock data for development
  const [user, setUser] = useState<any>({
    id: "fake-user-id",
    email: "buyer@example.com",
  });
  
  // Expanded mock profile data
  const [profile, setProfile] = useState<any>({
    business_name: "FreshStart Produce",
    business_verified: true,
    full_name: "Anil Sharma",
    phone: "9876543210",
    location: "APMC Market, Vashi",
    district: "Thane",
    state: "Maharashtra",
  });

  // State for the profile form
  const [buyerProfile, setBuyerProfile] = useState({
    business_name: profile?.business_name || "",
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    district: profile?.district || "",
    state: profile?.state || "",
  });

  /*
  useEffect(() => {
    // All auth and data fetching is commented out for demo purposes
  }, [navigate]);
  */

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handlePlaceOrder = (offering: any) => {
    toast.success(`Order placed for ${offering.crop.name} from ${offering.farmerName}!`);
  };

  // --- NEW HANDLERS FOR PROFILE FORM ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBuyerProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = () => {
    toast.success("Profile updated successfully!");
    // In a real app, you would save this data to Supabase
  };
  // ------------------------------------

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">AgriPrice Connect</h1>
            <p className="text-sm text-muted-foreground">Bulk Buyer Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <p className="font-medium">{profile?.business_name || "Buyer"}</p>
                {profile?.business_verified && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Farmer Connections</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Farmers in your network</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Orders</CardTitle>
              <PackageSearch className="h-4 w-4 text-organic" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myOrders.filter(o => o.status !== 'Completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Active orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18%</div>
              <p className="text-xs text-muted-foreground">vs. mandi price</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Marketplace, My Orders, and Profile */}
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace">Farmer Marketplace</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger> {/* <-- NEW TAB */}
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Find Farmers & Produce</CardTitle>
                <CardDescription>
                  Connect directly with farmers and browse their offerings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deals.map((offering) => (
                    <Card key={offering.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={offering.crop.image_url}
                          alt={offering.crop.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{offering.crop.name}</h3>
                            <p className="text-sm text-muted-foreground">{offering.crop.category}</p>
                          </div>
                          {offering.isOrganic && (
                             <Badge variant="default" className="bg-organic hover:bg-organic/80">
                               <Leaf className="h-3 w-3 mr-1" />
                               Organic
                             </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <span className="text-xl font-bold text-primary">
                            ₹{offering.price.toFixed(2)} / {offering.unit}
                          </span>
                        </div>

                        <Separator className="my-2" />
                        
                        <div className="text-sm mt-2">
                          <p className="font-medium">From: {offering.farmerName}</p>
                          <p className="text-muted-foreground">
                            {offering.location}
                          </p>
                        </div>

                        <Button className="w-full mt-4" onClick={() => handlePlaceOrder(offering)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Place Order
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {deals.length === 0 && (
                     <p className="text-muted-foreground col-span-3">No farmer offerings found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Track your active and completed orders.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.split('_')[1]}</TableCell>
                        <TableCell>{order.cropName}</TableCell>
                        <TableCell>{order.farmerName}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={order.status === 'Completed' ? 'secondary' : 'default'}
                            className={order.status === 'In Transit' ? 'bg-blue-500 text-white' : order.status === 'Processing' ? 'bg-yellow-500 text-white' : ''}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Track
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- NEW PROFILE TAB --- */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Business Profile</CardTitle>
                <CardDescription>Update your business and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input id="business_name" name="business_name" value={buyerProfile.business_name} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Contact Name</Label>
                    <Input id="full_name" name="full_name" value={buyerProfile.full_name} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={buyerProfile.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Address / Location</Label>
                    <Input id="location" name="location" value={buyerProfile.location} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" name="district" value={buyerProfile.district} onChange={handleProfileChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={buyerProfile.state} onChange={handleProfileChange} />
                  </div>
                </div>
                <Button onClick={handleProfileSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          {/* --- END OF NEW PROFILE TAB --- */}

        </Tabs> 
      </main>
    </div> 
  );
};

export default BuyerDashboard;