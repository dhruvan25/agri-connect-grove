import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

interface MandiPrice {
  id: string;
  price: number;
  unit: string;
  crop: {
    id: string;
    name: string;
    image_url: string;
  };
  mandi: {
    id: string;
    name: string;
    location: string;
    district: string;
    state: string;
  };
  isFavorite?: boolean;
}

const MandiPrices = () => {
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"price" | "district">("price");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [crops, setCrops] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get user
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);

        // Get favorites
        const { data: favData } = await supabase
          .from("favorites")
          .select("mandi_id")
          .eq("user_id", session.user.id);
        
        if (favData) {
          setFavorites(favData.map((f) => f.mandi_id));
        }
      }

      // Get crops
      const { data: cropsData } = await supabase.from("crops").select("*");
      if (cropsData) setCrops(cropsData);

      // Get prices with mandi and crop info
      const { data: pricesData } = await supabase
        .from("mandi_prices")
        .select(`
          id,
          price,
          unit,
          crop:crops(id, name, image_url),
          mandi:mandis(id, name, location, district, state)
        `);

      if (pricesData) {
        setPrices(pricesData as any);
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = async (mandiId: string) => {
    if (!userId) return;

    if (favorites.includes(mandiId)) {
      // Remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("mandi_id", mandiId);

      if (!error) {
        setFavorites(favorites.filter((id) => id !== mandiId));
        toast.success("Removed from favorites");
      }
    } else {
      // Add favorite
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, mandi_id: mandiId });

      if (!error) {
        setFavorites([...favorites, mandiId]);
        toast.success("Added to favorites");
      }
    }
  };

  // Filter and sort prices
  const filteredPrices = prices
    .filter((p) => {
      const matchesCrop = selectedCrop === "all" || p.crop.id === selectedCrop;
      const matchesSearch =
        p.mandi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mandi.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.crop.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCrop && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price") {
        return b.price - a.price;
      } else {
        return a.mandi.district.localeCompare(b.mandi.district);
      }
    });

  const favoritePrices = filteredPrices.filter((p) => favorites.includes(p.mandi.id));
  const otherPrices = filteredPrices.filter((p) => !favorites.includes(p.mandi.id));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Mandi Price Comparison</CardTitle>
          <CardDescription>Compare live prices across different mandis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mandi or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === "price" ? "district" : "price")}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by {sortBy === "price" ? "District" : "Price"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Mandis */}
      {favoritePrices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              Favorite Mandis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Mandi</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favoritePrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={price.crop.image_url}
                          alt={price.crop.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{price.crop.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{price.mandi.name}</TableCell>
                    <TableCell>
                      {price.mandi.district}, {price.mandi.state}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-base">
                        ₹{price.price.toFixed(2)}/{price.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(price.mandi.id)}
                      >
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Prices */}
      <Card>
        <CardHeader>
          <CardTitle>Live Mandi Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop</TableHead>
                <TableHead>Mandi</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={price.crop.image_url}
                        alt={price.crop.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{price.crop.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{price.mandi.name}</TableCell>
                  <TableCell>
                    {price.mandi.district}, {price.mandi.state}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-base">
                      ₹{price.price.toFixed(2)}/{price.unit}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(price.mandi.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MandiPrices;
